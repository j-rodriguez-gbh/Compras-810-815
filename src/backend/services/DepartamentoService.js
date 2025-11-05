const DepartamentoRepository = require('../repositories/DepartamentoRepository');
const { OrdenCompra } = require('../models/index');

class DepartamentoService {
  async getAll() {
    // Devolver todos los departamentos (activos e inactivos) para que el frontend pueda filtrar
    return await DepartamentoRepository.findAll();
  }

  async getById(id) {
    const departamento = await DepartamentoRepository.findById(id);
    if (!departamento) {
      throw new Error('Departamento no encontrado');
    }
    return departamento;
  }

  async create(data) {
    const departamentoExistente = await DepartamentoRepository.findByNombre(data.nombre);
    if (departamentoExistente) {
      throw new Error('Ya existe un departamento con ese nombre');
    }
    return await DepartamentoRepository.create(data);
  }

  async update(id, data) {
    const departamento = await this.getById(id);
    
    if (data.nombre && data.nombre !== departamento.nombre) {
      const departamentoExistente = await DepartamentoRepository.findByNombre(data.nombre);
      if (departamentoExistente && departamentoExistente.id !== id) {
        throw new Error('Ya existe un departamento con ese nombre');
      }
    }
    
    // Validar si se intenta desactivar y tiene órdenes de compra asociadas
    if (data.estado === 'Inactivo' && departamento.estado === 'Activo') {
      const ordenesCompra = await OrdenCompra.count({
        where: { departamentoId: id },
      });
      
      if (ordenesCompra > 0) {
        throw new Error('No se puede desactivar el departamento porque tiene órdenes de compra asociadas');
      }
    }
    
    return await DepartamentoRepository.update(id, data);
  }

  async delete(id) {
    const departamento = await this.getById(id);
    
    const ordenesCompra = await OrdenCompra.count({
      where: { departamentoId: id },
    });
    
    if (ordenesCompra > 0) {
      throw new Error('No se puede eliminar el departamento porque tiene órdenes de compra asociadas');
    }
    
    return await DepartamentoRepository.delete(id);
  }
}

module.exports = new DepartamentoService();

