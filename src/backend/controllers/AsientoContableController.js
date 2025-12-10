const ContabilidadService = require('../services/ContabilidadService');

class AsientoContableController {
  async getAll(req, res, next) {
    try {
      const { estado, ordenCompraId, fechaDesde, fechaHasta, tipoMovimiento } = req.query;
      
      const filters = {};
      if (estado) filters.estado = estado;
      if (ordenCompraId) filters.ordenCompraId = parseInt(ordenCompraId);
      if (fechaDesde) filters.fechaDesde = fechaDesde;
      if (fechaHasta) filters.fechaHasta = fechaHasta;
      if (tipoMovimiento) filters.tipoMovimiento = tipoMovimiento;

      const asientos = await ContabilidadService.getAllAsientos(filters);
      res.json({
        success: true,
        data: asientos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const asiento = await ContabilidadService.getAsientoById(id);
      res.json({
        success: true,
        data: asiento,
      });
    } catch (error) {
      next(error);
    }
  }

  async generarDesdeOrdenCompra(req, res, next) {
    try {
      const { ordenCompraId } = req.params;
      const asientos = await ContabilidadService.generarAsientosDesdeOrdenCompra(parseInt(ordenCompraId));
      res.status(201).json({
        success: true,
        data: asientos,
        message: 'Asientos contables generados exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async contabilizar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await ContabilidadService.contabilizarAsiento(parseInt(id));
      res.json({
        success: true,
        data: resultado,
        message: 'Asiento contabilizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async contabilizarPorOrden(req, res, next) {
    try {
      const { ordenCompraId } = req.params;
      const resultados = await ContabilidadService.contabilizarAsientosPorOrden(parseInt(ordenCompraId));
      res.json({
        success: true,
        data: resultados,
        message: 'Proceso de contabilización completado',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransaccionesPendientes(req, res, next) {
    try {
      const { fechaDesde, fechaHasta, incluirErrores } = req.query;
      
      let transacciones;
      if (incluirErrores === 'true') {
        // Incluir asientos pendientes y con error para poder reintentarlos
        transacciones = await ContabilidadService.getTransaccionesPendientesYConError(fechaDesde, fechaHasta);
      } else {
        // Solo asientos pendientes (comportamiento por defecto)
        transacciones = await ContabilidadService.getTransaccionesPendientes(fechaDesde, fechaHasta);
      }
      
      res.json({
        success: true,
        data: transacciones,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAsientosExternos(req, res, next) {
    try {
      const { fechaDesde, fechaHasta, accountId, movementType } = req.query;
      
      const filters = {};
      if (fechaDesde) filters.fechaDesde = fechaDesde;
      if (fechaHasta) filters.fechaHasta = fechaHasta;
      if (accountId) filters.accountId = accountId;
      if (movementType) filters.movementType = movementType;

      const asientos = await ContabilidadService.obtenerAsientosExternos(filters);
      res.json({
        success: true,
        data: asientos,
      });
    } catch (error) {
      next(error);
    }
  }

  async sincronizarAsientos(req, res, next) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      
      if (!fechaDesde || !fechaHasta) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren los parámetros fechaDesde y fechaHasta',
        });
      }

      const resultado = await ContabilidadService.sincronizarAsientos(fechaDesde, fechaHasta);
      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AsientoContableController();

