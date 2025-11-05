const { Proveedor } = require('../models/index');

class ProveedorRepository {
  async findAll(options = {}) {
    return await Proveedor.findAll({
      ...options,
      order: [['nombreComercial', 'ASC']],
    });
  }

  async findById(id, options = {}) {
    return await Proveedor.findByPk(id, options);
  }

  async create(data) {
    return await Proveedor.create(data);
  }

  async update(id, data) {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return null;
    }
    return await proveedor.update(data);
  }

  async delete(id) {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return null;
    }
    return await proveedor.update({ estado: 'Inactivo' });
  }

  async findByCedulaRNC(cedulaRNC) {
    return await Proveedor.findOne({
      where: { cedulaRNC },
    });
  }

  async count() {
    return await Proveedor.count({
      where: { estado: 'Activo' },
    });
  }
}

module.exports = new ProveedorRepository();

