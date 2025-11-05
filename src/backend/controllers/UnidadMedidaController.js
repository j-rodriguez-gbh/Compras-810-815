const UnidadMedidaService = require('../services/UnidadMedidaService');

class UnidadMedidaController {
  async getAll(req, res, next) {
    try {
      const unidadesMedida = await UnidadMedidaService.getAll();
      res.json({
        success: true,
        data: unidadesMedida,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const unidadMedida = await UnidadMedidaService.getById(id);
      res.json({
        success: true,
        data: unidadMedida,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const unidadMedida = await UnidadMedidaService.create(req.body);
      res.status(201).json({
        success: true,
        data: unidadMedida,
        message: 'Unidad de medida creada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const unidadMedida = await UnidadMedidaService.update(id, req.body);
      res.json({
        success: true,
        data: unidadMedida,
        message: 'Unidad de medida actualizada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await UnidadMedidaService.delete(id);
      res.json({
        success: true,
        message: 'Unidad de medida eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UnidadMedidaController();

