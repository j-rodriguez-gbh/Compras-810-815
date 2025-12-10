const { Usuario } = require('../models/index');

class UsuarioRepository {
  async findAll() {
    return await Usuario.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id) {
    return await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  }

  async findByUsername(username) {
    return await Usuario.findOne({
      where: { username },
    });
  }

  async findByEmail(email) {
    return await Usuario.findOne({
      where: { email },
    });
  }

  async create(data) {
    const usuario = await Usuario.create(data);
    return await this.findById(usuario.id);
  }

  async update(id, data) {
    await Usuario.update(data, {
      where: { id },
    });
    return await this.findById(id);
  }

  async delete(id) {
    return await Usuario.destroy({
      where: { id },
    });
  }
}

module.exports = new UsuarioRepository();

