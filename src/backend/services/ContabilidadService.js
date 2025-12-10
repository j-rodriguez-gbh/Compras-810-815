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

      // Manejar diferentes formatos de respuesta
      let token = null;
      
      // Formato 1: { isOk: true, data: { token: "..." } }
      if (response.data && response.data.isOk && response.data.data && response.data.data.token) {
        token = response.data.data.token;
      }
      // Formato 2: { token: "..." }
      else if (response.data && response.data.token) {
        token = response.data.token;
      }
      // Formato 3: Respuesta directa con token
      else if (typeof response.data === 'string' && response.data.startsWith('eyJ')) {
        token = response.data;
      }
      // Formato 4: { data: { token: "..." } }
      else if (response.data && response.data.data && response.data.data.token) {
        token = response.data.data.token;
      }

      if (token) {
        contabilidadToken = token;
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

        // Manejar diferentes formatos de respuesta
        let contabilidadId = null;
        if (response.data) {
          // Formato 1: { id: 123, ... }
          if (response.data.id) {
            contabilidadId = response.data.id;
          }
          // Formato 2: { data: { id: 123, ... } }
          else if (response.data.data && response.data.data.id) {
            contabilidadId = response.data.data.id;
          }
          // Formato 3: { isOk: true, data: { id: 123, ... } }
          else if (response.data.isOk && response.data.data && response.data.data.id) {
            contabilidadId = response.data.data.id;
          }
        }

        if (contabilidadId) {
          resultados.push({
            success: true,
            asientoId: lineaAsiento.id,
            contabilidadId: contabilidadId,
            data: response.data,
          });
          await lineaAsiento.update({ estado: 'Confirmado' });
        } else {
          todosExitosos = false;
          await lineaAsiento.update({ estado: 'Error' });
          resultados.push({
            success: false,
            asientoId: lineaAsiento.id,
            message: 'Respuesta inválida del sistema de contabilidad: no se recibió un ID válido',
            responseData: response.data,
          });
        }
      } catch (error) {
        todosExitosos = false;
        await lineaAsiento.update({ estado: 'Error' });

        let errorMessage = 'Error desconocido al enviar asiento';
        let errorDetails = null;
        
        if (error.response) {
          if (error.response.status === 401) {
            // Token inválido, limpiar cache
            contabilidadToken = null;
            errorMessage = 'Token de autenticación inválido. Intente nuevamente.';
            errorDetails = error.response.data;
          } else if (error.response.status === 400) {
            errorMessage = error.response.data?.message || 'Datos inválidos en la solicitud';
            errorDetails = error.response.data;
          } else if (error.response.status === 500) {
            errorMessage = 'Error interno del servidor de contabilidad';
            errorDetails = error.response.data;
          } else {
            errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.message}`;
            errorDetails = error.response.data;
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
          errorDetails,
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

  /**
   * Obtiene asientos contables del sistema externo
   * @param {Object} filters - Filtros opcionales para la consulta
   * @param {string} filters.fechaDesde - Fecha desde (formato YYYY-MM-DD)
   * @param {string} filters.fechaHasta - Fecha hasta (formato YYYY-MM-DD)
   * @param {number} filters.accountId - ID de cuenta contable
   * @param {string} filters.movementType - Tipo de movimiento (DB/CR)
   * @returns {Promise<Array>} Array de asientos contables del sistema externo
   */
  async obtenerAsientosExternos(filters = {}) {
    let token;
    try {
      token = await this.obtenerTokenContabilidad();
    } catch (error) {
      throw new Error(`Error al autenticarse con el sistema de contabilidad: ${error.message}`);
    }

    try {
      const apiUrl = `${config.contabilidadApiUrl}/api/v1/accounting-entries`;
      const params = {};

      // Agregar filtros opcionales
      if (filters.fechaDesde) {
        params.entryDateFrom = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        params.entryDateTo = filters.fechaHasta;
      }
      if (filters.accountId) {
        params.accountId = parseInt(filters.accountId);
      }
      if (filters.movementType) {
        params.movementType = filters.movementType;
      }

      const response = await axios.get(apiUrl, {
        params,
        timeout: 15000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Manejar diferentes formatos de respuesta
      let asientos = [];
      
      if (Array.isArray(response.data)) {
        asientos = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        asientos = response.data.data;
      } else if (response.data && response.data.isOk && Array.isArray(response.data.data)) {
        asientos = response.data.data;
      } else if (response.data && response.data.entries) {
        asientos = response.data.entries;
      } else {
        throw new Error('Formato de respuesta inesperado del sistema de contabilidad');
      }

      return asientos;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          // Token inválido, limpiar cache y reintentar
          contabilidadToken = null;
          throw new Error('Token de autenticación inválido. Intente nuevamente.');
        } else {
          throw new Error(
            `Error al obtener asientos del sistema de contabilidad: ${error.response.data?.message || error.message}`
          );
        }
      } else if (error.request) {
        throw new Error('No se pudo conectar con el sistema de contabilidad');
      } else {
        throw new Error(`Error al obtener asientos externos: ${error.message}`);
      }
    }
  }

  /**
   * Sincroniza y compara asientos entre el sistema local y el externo
   * @param {string} fechaDesde - Fecha desde para comparar
   * @param {string} fechaHasta - Fecha hasta para comparar
   * @returns {Promise<Object>} Objeto con comparación de asientos
   */
  async sincronizarAsientos(fechaDesde, fechaHasta) {
    try {
      // Obtener asientos locales
      const asientosLocales = await this.getTransaccionesPendientes(fechaDesde, fechaHasta);
      
      // Obtener asientos externos
      const asientosExternos = await this.obtenerAsientosExternos({
        fechaDesde,
        fechaHasta,
      });

      // Comparar y encontrar discrepancias
      const discrepancias = [];
      const asientosSincronizados = [];

      // Mapear asientos externos por identificador único (si existe)
      const externosMap = new Map();
      asientosExternos.forEach((ext) => {
        const key = `${ext.accountId}-${ext.entryDate}-${ext.amount}-${ext.movementType}`;
        externosMap.set(key, ext);
      });

      // Comparar asientos locales con externos
      asientosLocales.forEach((local) => {
        const key = `${local.cuentaContable}-${local.fechaAsiento}-${local.montoAsiento}-${local.tipoMovimiento}`;
        const externo = externosMap.get(key);
        
        if (externo) {
          asientosSincronizados.push({
            local,
            externo,
            sincronizado: true,
          });
        } else {
          discrepancias.push({
            local,
            tipo: 'No encontrado en sistema externo',
          });
        }
      });

      return {
        asientosLocales: asientosLocales.length,
        asientosExternos: asientosExternos.length,
        sincronizados: asientosSincronizados.length,
        discrepancias: discrepancias.length,
        detalles: {
          sincronizados: asientosSincronizados,
          discrepancias,
        },
      };
    } catch (error) {
      throw new Error(`Error al sincronizar asientos: ${error.message}`);
    }
  }
}

module.exports = new ContabilidadService();

