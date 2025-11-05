const OrdenCompraService = require('../services/OrdenCompraService');

class OrdenCompraController {
  async getAll(req, res, next) {
    try {
      const ordenesCompra = await OrdenCompraService.getAll();
      res.json({
        success: true,
        data: ordenesCompra,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const ordenCompra = await OrdenCompraService.getById(id);
      res.json({
        success: true,
        data: ordenCompra,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const ordenCompra = await OrdenCompraService.create(req.body);
      res.status(201).json({
        success: true,
        data: ordenCompra,
        message: 'Orden de compra creada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const ordenCompra = await OrdenCompraService.update(id, req.body);
      res.json({
        success: true,
        data: ordenCompra,
        message: 'Orden de compra actualizada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await OrdenCompraService.delete(id);
      res.json({
        success: true,
        message: 'Orden de compra eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async consultarPorCriterios(req, res, next) {
    try {
      const criterios = req.query;
      const ordenesCompra = await OrdenCompraService.consultarPorCriterios(criterios);
      res.json({
        success: true,
        data: ordenesCompra,
      });
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado || typeof estado !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El estado es requerido y debe ser una cadena de texto',
        });
      }
      
      const ordenCompra = await OrdenCompraService.cambiarEstado(id, estado);
      res.json({
        success: true,
        data: ordenCompra,
        message: `Estado de la orden cambiado a "${estado}" exitosamente`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEstadosPosibles(req, res, next) {
    try {
      const { id } = req.params;
      const estadosPosibles = await OrdenCompraService.getEstadosPosibles(id);
      res.json({
        success: true,
        data: estadosPosibles,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrdenCompraController();

