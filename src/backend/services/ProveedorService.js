const ProveedorRepository = require('../repositories/ProveedorRepository');
const { OrdenCompra } = require('../models/index');

class ProveedorService {
  async getAll() {
    // Devolver todos los proveedores (activos e inactivos) para que el frontend pueda filtrar
    return await ProveedorRepository.findAll();
  }

  async getById(id) {
    const proveedor = await ProveedorRepository.findById(id);
    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }
    return proveedor;
  }

  async create(data) {
    const proveedorExistente = await ProveedorRepository.findByCedulaRNC(data.cedulaRNC);
    if (proveedorExistente) {
      throw new Error('Ya existe un proveedor con esa cédula/RNC');
    }
    return await ProveedorRepository.create(data);
  }

  async update(id, data) {
    const proveedor = await this.getById(id);
    
    if (data.cedulaRNC && data.cedulaRNC !== proveedor.cedulaRNC) {
      const proveedorExistente = await ProveedorRepository.findByCedulaRNC(data.cedulaRNC);
      if (proveedorExistente && proveedorExistente.id !== id) {
        throw new Error('Ya existe un proveedor con esa cédula/RNC');
      }
    }
    
    // Validar si se intenta desactivar y tiene órdenes de compra asociadas
    if (data.estado === 'Inactivo' && proveedor.estado === 'Activo') {
      const ordenesCompra = await OrdenCompra.count({
        where: { proveedorId: id },
      });
      
      if (ordenesCompra > 0) {
        throw new Error('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');
      }
    }
    
    return await ProveedorRepository.update(id, data);
  }

  async delete(id) {
    const proveedor = await this.getById(id);
    
    const ordenesCompra = await OrdenCompra.count({
      where: { proveedorId: id },
    });
    
    if (ordenesCompra > 0) {
      throw new Error('No se puede eliminar el proveedor porque tiene órdenes de compra asociadas');
    }
    
    return await ProveedorRepository.delete(id);
  }
}

module.exports = new ProveedorService();

