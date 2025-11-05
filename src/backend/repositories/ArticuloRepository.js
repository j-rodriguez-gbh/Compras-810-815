const { Articulo } = require('../models/index');

class ArticuloRepository {
  async findAll(options = {}) {
    return await Articulo.findAll({
      ...options,
      order: [['descripcion', 'ASC']],
    });
  }

  async findById(id, options = {}) {
    return await Articulo.findByPk(id, options);
  }

  async create(data) {
    return await Articulo.create(data);
  }

  async update(id, data) {
    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return null;
    }
    return await articulo.update(data);
  }

  async delete(id) {
    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return null;
    }
    return await articulo.update({ estado: 'Inactivo' });
  }

  async findByDescripcion(descripcion) {
    return await Articulo.findOne({
      where: { descripcion },
    });
  }

  async count() {
    return await Articulo.count({
      where: { estado: 'Activo' },
    });
  }

  async updateExistencia(id, cantidad) {
    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return null;
    }
    const nuevaExistencia = parseFloat(articulo.existencia) + parseFloat(cantidad);
    return await articulo.update({ existencia: nuevaExistencia });
  }
}

module.exports = new ArticuloRepository();

