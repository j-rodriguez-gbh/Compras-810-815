const ProveedorService = require('../services/ProveedorService');

class ProveedorController {
  async getAll(req, res, next) {
    try {
      const proveedores = await ProveedorService.getAll();
      res.json({
        success: true,
        data: proveedores,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const proveedor = await ProveedorService.getById(id);
      res.json({
        success: true,
        data: proveedor,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const proveedor = await ProveedorService.create(req.body);
      res.status(201).json({
        success: true,
        data: proveedor,
        message: 'Proveedor creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const proveedor = await ProveedorService.update(id, req.body);
      res.json({
        success: true,
        data: proveedor,
        message: 'Proveedor actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await ProveedorService.delete(id);
      res.json({
        success: true,
        message: 'Proveedor eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProveedorController();

