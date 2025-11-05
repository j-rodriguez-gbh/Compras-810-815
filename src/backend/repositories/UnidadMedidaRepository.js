const { UnidadMedida } = require('../models/index');

class UnidadMedidaRepository {
  async findAll(options = {}) {
    return await UnidadMedida.findAll({
      ...options,
      order: [['descripcion', 'ASC']],
    });
  }

  async findById(id, options = {}) {
    return await UnidadMedida.findByPk(id, options);
  }

  async create(data) {
    return await UnidadMedida.create(data);
  }

  async update(id, data) {
    const unidadMedida = await UnidadMedida.findByPk(id);
    if (!unidadMedida) {
      return null;
    }
    return await unidadMedida.update(data);
  }

  async delete(id) {
    const unidadMedida = await UnidadMedida.findByPk(id);
    if (!unidadMedida) {
      return null;
    }
    return await unidadMedida.update({ estado: 'Inactivo' });
  }

  async findByDescripcion(descripcion) {
    return await UnidadMedida.findOne({
      where: { descripcion },
    });
  }

  async count() {
    return await UnidadMedida.count({
      where: { estado: 'Activo' },
    });
  }
}

module.exports = new UnidadMedidaRepository();

