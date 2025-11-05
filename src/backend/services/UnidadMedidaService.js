const UnidadMedidaRepository = require('../repositories/UnidadMedidaRepository');
const { Articulo, OrdenCompraDetalle } = require('../models/index');

class UnidadMedidaService {
  async getAll() {
    // Devolver todas las unidades de medida (activas e inactivas) para que el frontend pueda filtrar
    return await UnidadMedidaRepository.findAll();
  }

  async getById(id) {
    const unidadMedida = await UnidadMedidaRepository.findById(id);
    if (!unidadMedida) {
      throw new Error('Unidad de medida no encontrada');
    }
    return unidadMedida;
  }

  async create(data) {
    const unidadExistente = await UnidadMedidaRepository.findByDescripcion(data.descripcion);
    if (unidadExistente) {
      throw new Error('Ya existe una unidad de medida con esa descripción');
    }
    return await UnidadMedidaRepository.create(data);
  }

  async update(id, data) {
    const unidadMedida = await this.getById(id);
    
    if (data.descripcion && data.descripcion !== unidadMedida.descripcion) {
      const unidadExistente = await UnidadMedidaRepository.findByDescripcion(data.descripcion);
      if (unidadExistente && unidadExistente.id !== id) {
        throw new Error('Ya existe una unidad de medida con esa descripción');
      }
    }
    
    // Validar si se intenta desactivar y está en uso
    if (data.estado === 'Inactivo' && unidadMedida.estado === 'Activo') {
      const articulos = await Articulo.count({
        where: { unidadMedidaId: id },
      });
      
      const detalles = await OrdenCompraDetalle.count({
        where: { unidadMedidaId: id },
      });
      
      if (articulos > 0 || detalles > 0) {
        throw new Error('No se puede desactivar la unidad de medida porque está siendo usada en artículos u órdenes de compra');
      }
    }
    
    return await UnidadMedidaRepository.update(id, data);
  }

  async delete(id) {
    const unidadMedida = await this.getById(id);
    
    const articulos = await Articulo.count({
      where: { unidadMedidaId: id },
    });
    
    const detalles = await OrdenCompraDetalle.count({
      where: { unidadMedidaId: id },
    });
    
    if (articulos > 0 || detalles > 0) {
      throw new Error('No se puede eliminar la unidad de medida porque está en uso');
    }
    
    return await UnidadMedidaRepository.delete(id);
  }
}

module.exports = new UnidadMedidaService();

