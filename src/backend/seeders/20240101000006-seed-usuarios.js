'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('Usuario', [
      {
        username: 'admin',
        email: 'admin@sistema.com',
        password: hashedPassword,
        nombre: 'Administrador',
        rol: 'Administrador',
        estado: 'Activo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'usuario',
        email: 'usuario@sistema.com',
        password: hashedPassword,
        nombre: 'Usuario Demo',
        rol: 'Usuario',
        estado: 'Activo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuario', null, {});
  },
};

