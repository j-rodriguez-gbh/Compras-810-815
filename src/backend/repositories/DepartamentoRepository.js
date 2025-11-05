const { Departamento } = require('../models/index');

class DepartamentoRepository {
  async findAll(options = {}) {
    return await Departamento.findAll({
      ...options,
      order: [['nombre', 'ASC']],
    });
  }

  async findById(id, options = {}) {
    return await Departamento.findByPk(id, options);
  }

  async create(data) {
    return await Departamento.create(data);
  }

  async update(id, data) {
    const departamento = await Departamento.findByPk(id);
    if (!departamento) {
      return null;
    }
    return await departamento.update(data);
  }

  async delete(id) {
    const departamento = await Departamento.findByPk(id);
    if (!departamento) {
      return null;
    }
    return await departamento.update({ estado: 'Inactivo' });
  }

  async findByNombre(nombre) {
    return await Departamento.findOne({
      where: { nombre },
    });
  }

  async count() {
    return await Departamento.count({
      where: { estado: 'Activo' },
    });
  }
}

module.exports = new DepartamentoRepository();

