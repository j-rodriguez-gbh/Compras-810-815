const AsientoContableRepository = require('../repositories/AsientoContableRepository');
const OrdenCompraRepository = require('../repositories/OrdenCompraRepository');
const axios = require('axios');
const config = require('../config/environment');

// Cache para el token de autenticación (no expira según documentación)
let contabilidadToken = null;

class ContabilidadService {
  async obtenerTokenContabilidad() {
    // Si ya tenemos un token cacheado, reutilizarlo
    if (contabilidadToken) {
      return contabilidadToken;
    }

    try {
      const response = await axios.post(
        `${config.contabilidadApiUrl}/api/v1/auth/login`,
        {
          username: config.contabilidadUsername,
          password: config.contabilidadPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.isOk && response.data.data && response.data.data.token) {
        contabilidadToken = response.data.data.token;
        return contabilidadToken;
      } else {
        throw new Error('No se recibió un token válido del sistema de contabilidad');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Error al autenticarse con el sistema de contabilidad: ${error.response.data?.message || error.message}`
        );
      } else if (error.request) {
        throw new Error('No se pudo conectar con el sistema de contabilidad');
      } else {
        throw new Error(`Error de autenticación: ${error.message}`);
      }
    }
  }
  async getAllAsientos(filters = {}) {
    if (Object.keys(filters).length > 0) {
      return await AsientoContableRepository.findByCriterios(filters);
    }
    return await AsientoContableRepository.findAll();
  }

  async getAsientoById(id) {
    const asiento = await AsientoContableRepository.findById(id);
    if (!asiento) {
      throw new Error('Asiento contable no encontrado');
    }
    return asiento;
  }

  async generarAsientosDesdeOrdenCompra(ordenCompraId) {
    const ordenCompra = await OrdenCompraRepository.findById(ordenCompraId, {
      include: [
        'departamento',
        'proveedor',
        {
          association: 'detalles',
          include: ['articulo', 'unidadMedida'],
        },
      ],
    });

    if (!ordenCompra) {
      throw new Error('Orden de compra no encontrada');
    }

    if (ordenCompra.estado !== 'Aprobada') {
      throw new Error('Solo se pueden generar asientos contables para órdenes aprobadas');
    }

    const asientosExistentes = await AsientoContableRepository.findByOrdenCompraId(ordenCompraId);
    if (asientosExistentes.length > 0) {
      throw new Error('Ya existen asientos contables para esta orden de compra');
    }

    const asientos = [];
    const fechaAsiento = ordenCompra.fechaOrden || new Date().toISOString().split('T')[0];
    const identificadorBase = `OC-${ordenCompra.numeroOrden}`;

    let totalOrden = 0;
    ordenCompra.detalles.forEach((detalle) => {
      totalOrden += parseFloat(detalle.subtotal || 0);
    });

    // Según el Excel: Asiento Compras
    // Id. Auxiliar: 7 (Compras)
    // Cuenta 80: Compra de Mercancias (DB)
    // Cuenta 82: Cuentas x Pagar Proveedor X (CR)
    
    // Asiento 1: Compra de Mercancías (DB)
    asientos.push({
      identificadorAsiento: `${identificadorBase}-COMP`,
      descripcion: `Compra de Mercancías - Orden ${ordenCompra.numeroOrden}`,
      tipoInventarioId: '7', // Id. Auxiliar: 7 (Compras)
      cuentaContable: '80', // Compra de Mercancias
      tipoMovimiento: 'DB',
      fechaAsiento,
      montoAsiento: totalOrden,
      estado: 'Pendiente',
      ordenCompraId: ordenCompraId,
    });

    // Asiento 2: Cuentas por Pagar (CR)
    asientos.push({
      identificadorAsiento: `${identificadorBase}-CXP`,
      descripcion: `Cuentas x Pagar Proveedor ${ordenCompra.proveedor?.nombreComercial || 'N/A'} - Orden ${ordenCompra.numeroOrden}`,
      tipoInventarioId: '7', // Id. Auxiliar: 7 (Compras)
      cuentaContable: '82', // Cuentas x Pagar Proveedor X
      tipoMovimiento: 'CR',
      fechaAsiento,
      montoAsiento: totalOrden,
      estado: 'Pendiente',
      ordenCompraId: ordenCompraId,
    });

    const asientosCreados = await AsientoContableRepository.createMany(asientos);
    return asientosCreados;
  }

  async contabilizarAsiento(id) {
    const asiento = await this.getAsientoById(id);

    if (asiento.estado !== 'Pendiente') {
      throw new Error(`No se puede contabilizar un asiento en estado: ${asiento.estado}`);
    }

    if (!asiento.ordenCompraId) {
      throw new Error('El asiento debe estar asociado a una orden de compra para contabilizarse');
    }

    try {
      // Marcar como enviado antes de procesar
      await asiento.update({ estado: 'Enviado' });

      const resultado = await this.enviarAsientoContable(asiento);

      if (resultado.success) {
        // El método enviarAsientoContable ya actualiza los estados a Confirmado
        return {
          success: true,
          asiento: await this.getAsientoById(id),
          resultados: resultado.resultados,
          message: resultado.message || 'Asiento contabilizado exitosamente',
        };
      } else {
        // El método enviarAsientoContable ya actualiza los estados a Error
        const mensajeError = resultado.resultados && resultado.resultados.length > 0
          ? resultado.resultados.map(r => r.message).join('; ')
          : resultado.message || 'Error al enviar asiento contable';
        throw new Error(mensajeError);
      }
    } catch (error) {
      // Asegurar que se marque como error si algo falla
      await asiento.update({ estado: 'Error' });
      throw error;
    }
  }

  async contabilizarAsientosPorOrden(ordenCompraId) {
    const asientos = await AsientoContableRepository.findByOrdenCompraId(ordenCompraId);

    if (asientos.length === 0) {
      throw new Error('No hay asientos contables para esta orden de compra');
    }

    const resultados = [];
    for (const asiento of asientos) {
      if (asiento.estado === 'Pendiente') {
        try {
          const resultado = await this.contabilizarAsiento(asiento.id);
          resultados.push(resultado);
        } catch (error) {
          resultados.push({
            success: false,
            asientoId: asiento.id,
            message: error.message,
          });
        }
      }
    }

    return resultados;
  }

  async enviarAsientoContable(asiento) {
    // Obtener token de autenticación (usa cache si existe)
    let token;
    try {
      token = await this.obtenerTokenContabilidad();
    } catch (error) {
      await asiento.update({ estado: 'Error' });
      return {
        success: false,
        message: error.message || 'Error al autenticarse con el sistema de contabilidad',
      };
    }

    // Obtener todos los asientos relacionados de la misma orden
    const asientosRelacionados = await AsientoContableRepository.findByOrdenCompraId(asiento.ordenCompraId);
    
    // Filtrar solo los asientos pendientes del mismo tipo (mismo tipoInventarioId)
    const asientosDelMismoTipo = asientosRelacionados.filter(
      a => a.tipoInventarioId === asiento.tipoInventarioId && a.estado === 'Pendiente'
    );

    if (asientosDelMismoTipo.length < 2) {
      return {
        success: false,
        message: 'Un asiento contable debe tener al menos 2 líneas (1 DB y 1 CR)',
      };
    }

    // Verificar que haya al menos 1 DB y 1 CR
    const tieneDB = asientosDelMismoTipo.some(a => a.tipoMovimiento === 'DB');
    const tieneCR = asientosDelMismoTipo.some(a => a.tipoMovimiento === 'CR');

    if (!tieneDB || !tieneCR) {
      return {
        success: false,
        message: 'Un asiento contable debe tener al menos una línea DB y una línea CR',
      };
    }

    const apiUrl = `${config.contabilidadApiUrl}/api/v1/accounting-entries`;
    const descripcion = asientosDelMismoTipo[0].descripcion || `Compra orden ${asiento.ordenCompraId}`;
    const fechaAsiento = asiento.fechaAsiento || new Date().toISOString().split('T')[0];

    const resultados = [];
    let todosExitosos = true;

    // Enviar cada línea del asiento por separado según el formato del API
    for (const lineaAsiento of asientosDelMismoTipo) {
      try {
        const payload = {
          description: descripcion,
          accountId: parseInt(lineaAsiento.cuentaContable),
          movementType: lineaAsiento.tipoMovimiento,
          amount: parseFloat(lineaAsiento.montoAsiento),
          entryDate: fechaAsiento,
        };

        const response = await axios.post(apiUrl, payload, {
          timeout: 15000,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data && response.data.id) {
          resultados.push({
            success: true,
            asientoId: lineaAsiento.id,
            contabilidadId: response.data.id,
            data: response.data,
          });
          await lineaAsiento.update({ estado: 'Confirmado' });
        } else {
          todosExitosos = false;
          await lineaAsiento.update({ estado: 'Error' });
          resultados.push({
            success: false,
            asientoId: lineaAsiento.id,
            message: 'Respuesta inválida del sistema de contabilidad',
          });
        }
      } catch (error) {
        todosExitosos = false;
        await lineaAsiento.update({ estado: 'Error' });

        let errorMessage = 'Error desconocido al enviar asiento';
        if (error.response) {
          if (error.response.status === 401) {
            // Token inválido, limpiar cache y reintentar
            contabilidadToken = null;
            errorMessage = 'Token de autenticación inválido. Intente nuevamente.';
          } else {
            errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.message}`;
          }
        } else if (error.request) {
          errorMessage = 'No se pudo conectar con el sistema de contabilidad';
        } else {
          errorMessage = error.message;
        }

        resultados.push({
          success: false,
          asientoId: lineaAsiento.id,
          message: errorMessage,
        });
      }
    }

    return {
      success: todosExitosos,
      resultados,
      message: todosExitosos
        ? 'Asientos contabilizados exitosamente'
        : 'Algunos asientos tuvieron errores al contabilizarse',
    };
  }

  async getTransaccionesPendientes(fechaDesde, fechaHasta) {
    const criterios = {
      estado: 'Pendiente',
    };

    if (fechaDesde) {
      criterios.fechaDesde = fechaDesde;
    }
    if (fechaHasta) {
      criterios.fechaHasta = fechaHasta;
    }

    return await AsientoContableRepository.findByCriterios(criterios);
  }
}

module.exports = new ContabilidadService();

