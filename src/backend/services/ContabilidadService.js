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

    // Permitir contabilizar asientos en estado Pendiente o Error (para reintentar)
    if (asiento.estado !== 'Pendiente' && asiento.estado !== 'Error') {
      throw new Error(`No se puede contabilizar un asiento en estado: ${asiento.estado}. Solo se pueden contabilizar asientos en estado Pendiente o Error.`);
    }

    if (!asiento.ordenCompraId) {
      throw new Error('El asiento debe estar asociado a una orden de compra para contabilizarse');
    }

    try {
      // Si está en Error, volver a Pendiente antes de reintentar
      if (asiento.estado === 'Error') {
        await asiento.update({ estado: 'Pendiente' });
        // Recargar el asiento para tener el estado actualizado
        const asientoActualizado = await this.getAsientoById(id);
        Object.assign(asiento, asientoActualizado);
      }

      // NO marcar como "Enviado" todavía - primero validar que podemos enviar
      // El método enviarAsientoContable se encargará de marcar como "Enviado" cuando realmente los envíe
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
      // Permitir contabilizar asientos Pendientes o con Error (para reintentar)
      if (asiento.estado === 'Pendiente' || asiento.estado === 'Error') {
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
    // PRIMERO: Obtener todos los asientos relacionados de la misma orden
    // Esto debe hacerse ANTES de cambiar cualquier estado
    const asientosRelacionados = await AsientoContableRepository.findByOrdenCompraId(asiento.ordenCompraId);
    
    // Filtrar asientos pendientes o con error (para poder reintentar)
    const asientosPendientes = asientosRelacionados.filter(
      a => a.estado === 'Pendiente' || a.estado === 'Error'
    );

    // Validar ANTES de hacer cualquier cambio
    if (asientosPendientes.length < 2) {
      const estados = asientosRelacionados.map(a => `${a.id}(${a.estado})`).join(', ');
      return {
        success: false,
        message: `Un asiento contable debe tener al menos 2 líneas (1 DB y 1 CR). Asientos encontrados: ${asientosRelacionados.length}, Pendientes: ${asientosPendientes.length}. Estados: [${estados}]`,
      };
    }

    // Verificar que haya al menos 1 DB y 1 CR
    const tieneDB = asientosPendientes.some(a => a.tipoMovimiento === 'DB');
    const tieneCR = asientosPendientes.some(a => a.tipoMovimiento === 'CR');

    if (!tieneDB || !tieneCR) {
      const tipos = asientosPendientes.map(a => a.tipoMovimiento).join(', ');
      return {
        success: false,
        message: `Un asiento contable debe tener al menos una línea DB y una línea CR. Tipos encontrados: [${tipos}]`,
      };
    }

    // AHORA SÍ: Obtener token de autenticación (usa cache si existe)
    let token;
    try {
      token = await this.obtenerTokenContabilidad();
    } catch (error) {
      // Si falla la autenticación, marcar todos los asientos pendientes como error
      for (const a of asientosPendientes) {
        await a.update({ estado: 'Error' });
      }
      return {
        success: false,
        message: error.message || 'Error al autenticarse con el sistema de contabilidad',
      };
    }

    // Marcar todos los asientos pendientes como "Enviado" antes de enviarlos
    for (const a of asientosPendientes) {
      await a.update({ estado: 'Enviado' });
    }

    const apiUrl = `${config.contabilidadApiUrl}/api/v1/accounting-entries`;
    const descripcion = asientosPendientes[0].descripcion || `Compra orden ${asiento.ordenCompraId}`;
    const fechaAsiento = asiento.fechaAsiento || new Date().toISOString().split('T')[0];

    const resultados = [];
    let todosExitosos = true;

    // Enviar cada línea del asiento por separado según el formato del API
    // El tipoInventarioId corresponde al auxiliaryId (Id. Auxiliar: 7 = Compras)
    // Usar el tipoInventarioId del primer asiento pendiente, o default a 7
    const auxiliaryId = parseInt(asientosPendientes[0].tipoInventarioId) || 7; // Default a 7 (Compras) si no está definido
    
    for (const lineaAsiento of asientosPendientes) {
      try {
        const accountId = parseInt(lineaAsiento.cuentaContable);
        const amount = parseFloat(lineaAsiento.montoAsiento);
        
        // Validar que los valores sean válidos
        if (isNaN(accountId) || accountId <= 0) {
          throw new Error(`ID de cuenta inválido: ${lineaAsiento.cuentaContable}`);
        }
        if (isNaN(amount) || amount <= 0) {
          throw new Error(`Monto inválido: ${lineaAsiento.montoAsiento}`);
        }
        if (isNaN(auxiliaryId) || auxiliaryId <= 0) {
          throw new Error(`Auxiliary ID inválido: ${asiento.tipoInventarioId}`);
        }

        const payload = {
          description: descripcion,
          accountId: accountId,
          movementType: lineaAsiento.tipoMovimiento,
          amount: amount,
          entryDate: fechaAsiento,
          auxiliaryId: auxiliaryId, // Agregar auxiliaryId requerido por el API
        };

        console.log('Enviando asiento al API de contabilidad:', JSON.stringify(payload, null, 2));

        const response = await axios.post(apiUrl, payload, {
          timeout: 15000,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Respuesta del API de contabilidad:', JSON.stringify(response.data, null, 2));

        // Manejar diferentes formatos de respuesta del API
        let contabilidadId = null;
        if (response.data) {
          // Formato 1: { id: 123, ... } - respuesta directa
          if (response.data.id) {
            contabilidadId = response.data.id;
          }
          // Formato 2: { data: { id: 123, ... } }
          else if (response.data.data && response.data.data.id) {
            contabilidadId = response.data.data.id;
          }
          // Formato 3: { isOk: true, data: { id: 123, ... } } - formato estándar del API
          else if (response.data.isOk && response.data.data) {
            if (response.data.data.id) {
              contabilidadId = response.data.data.id;
            } else if (Array.isArray(response.data.data) && response.data.data.length > 0) {
              // Si data es un array, tomar el primer elemento
              contabilidadId = response.data.data[0].id;
            }
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
            // Intentar obtener el mensaje de error más descriptivo
            const errorData = error.response.data;
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else {
              errorMessage = 'Datos inválidos en la solicitud. Verifique que todos los campos requeridos estén presentes.';
            }
            errorDetails = errorData;
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

  async getTransaccionesPendientesYConError(fechaDesde, fechaHasta) {
    const criterios = {};

    if (fechaDesde) {
      criterios.fechaDesde = fechaDesde;
    }
    if (fechaHasta) {
      criterios.fechaHasta = fechaHasta;
    }

    // Obtener asientos pendientes y con error
    const pendientes = await AsientoContableRepository.findByCriterios({
      ...criterios,
      estado: 'Pendiente',
    });
    
    const conError = await AsientoContableRepository.findByCriterios({
      ...criterios,
      estado: 'Error',
    });

    return [...pendientes, ...conError];
  }

  /**
   * Obtiene asientos contables del sistema externo
   * @param {Object} filters - Filtros opcionales para la consulta
   * @param {string} filters.startDate - Fecha desde (formato YYYY-MM-DD) - rango inclusivo
   * @param {string} filters.endDate - Fecha hasta (formato YYYY-MM-DD) - rango inclusivo
   * @param {string} filters.entryDate - Fecha exacta (formato YYYY-MM-DD)
   * @param {number} filters.accountId - ID de cuenta contable
   * @param {string} filters.movementType - Tipo de movimiento (DB/CR)
   * @param {number} filters.auxiliaryId - ID de sistema auxiliar (opcional, se aplica automáticamente según token)
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

      // Agregar filtros opcionales según la documentación del API
      // startDate / endDate: filtra por rango inclusivo
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      // entryDate: coincide exactamente una fecha (tiene prioridad sobre startDate/endDate si ambos están presentes)
      if (filters.entryDate) {
        params.entryDate = filters.entryDate;
      }
      // accountId: filtra por identificador de cuenta
      if (filters.accountId) {
        params.accountId = parseInt(filters.accountId);
      }
      // movementType: DB o CR
      if (filters.movementType) {
        params.movementType = filters.movementType;
      }
      // auxiliaryId: restringe a un sistema auxiliar específico (se aplica automáticamente según el token, pero puede especificarse)
      if (filters.auxiliaryId) {
        params.auxiliaryId = parseInt(filters.auxiliaryId);
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

      // Ordenar por ID de forma descendente (más recientes primero)
      asientos.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idB - idA; // Orden descendente
      });

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

}

module.exports = new ContabilidadService();

