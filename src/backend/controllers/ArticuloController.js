const ArticuloService = require('../services/ArticuloService');

class ArticuloController {
  async getAll(req, res, next) {
    try {
      const articulos = await ArticuloService.getAll();
      res.json({
        success: true,
        data: articulos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const articulo = await ArticuloService.getById(id);
      res.json({
        success: true,
        data: articulo,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const articulo = await ArticuloService.create(req.body);
      res.status(201).json({
        success: true,
        data: articulo,
        message: 'Artículo creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const articulo = await ArticuloService.update(id, req.body);
      res.json({
        success: true,
        data: articulo,
        message: 'Artículo actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await ArticuloService.delete(id);
      res.json({
        success: true,
        message: 'Artículo eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArticuloController();

