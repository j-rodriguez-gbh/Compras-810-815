const DepartamentoService = require('../services/DepartamentoService');

class DepartamentoController {
  async getAll(req, res, next) {
    try {
      const departamentos = await DepartamentoService.getAll();
      res.json({
        success: true,
        data: departamentos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const departamento = await DepartamentoService.getById(id);
      res.json({
        success: true,
        data: departamento,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const departamento = await DepartamentoService.create(req.body);
      res.status(201).json({
        success: true,
        data: departamento,
        message: 'Departamento creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const departamento = await DepartamentoService.update(id, req.body);
      res.json({
        success: true,
        data: departamento,
        message: 'Departamento actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await DepartamentoService.delete(id);
      res.json({
        success: true,
        message: 'Departamento eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartamentoController();

