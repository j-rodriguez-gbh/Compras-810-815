const ArticuloRepository = require('../repositories/ArticuloRepository');
const UnidadMedidaRepository = require('../repositories/UnidadMedidaRepository');
const { OrdenCompraDetalle } = require('../models/index');

class ArticuloService {
  async getAll() {
    // Devolver todos los artículos (activos e inactivos) para que el frontend pueda filtrar
    return await ArticuloRepository.findAll({
      include: ['unidadMedida'],
    });
  }

  async getById(id) {
    const articulo = await ArticuloRepository.findById(id, {
      include: ['unidadMedida'],
    });
    if (!articulo) {
      throw new Error('Artículo no encontrado');
    }
    return articulo;
  }

  async create(data) {
    const unidadMedida = await UnidadMedidaRepository.findById(data.unidadMedidaId);
    if (!unidadMedida) {
      throw new Error('Unidad de medida no encontrada');
    }
    if (unidadMedida.estado !== 'Activo') {
      throw new Error('La unidad de medida debe estar activa');
    }
    return await ArticuloRepository.create(data);
  }

  async update(id, data) {
    const articulo = await this.getById(id);
    
    if (data.unidadMedidaId) {
      const unidadMedida = await UnidadMedidaRepository.findById(data.unidadMedidaId);
      if (!unidadMedida) {
        throw new Error('Unidad de medida no encontrada');
      }
      if (unidadMedida.estado !== 'Activo') {
        throw new Error('La unidad de medida debe estar activa');
      }
    }
    
    // Validar si se intenta desactivar y está en órdenes de compra
    if (data.estado === 'Inactivo' && articulo.estado === 'Activo') {
      const detalles = await OrdenCompraDetalle.count({
        where: { articuloId: id },
      });
      
      if (detalles > 0) {
        throw new Error('No se puede desactivar el artículo porque está siendo usado en órdenes de compra');
      }
    }
    
    return await ArticuloRepository.update(id, data);
  }

  async delete(id) {
    const articulo = await this.getById(id);
    
    const detalles = await OrdenCompraDetalle.count({
      where: { articuloId: id },
    });
    
    if (detalles > 0) {
      throw new Error('No se puede eliminar el artículo porque está en órdenes de compra');
    }
    
    return await ArticuloRepository.delete(id);
  }
}

module.exports = new ArticuloService();

