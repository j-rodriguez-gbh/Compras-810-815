'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      rol: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Usuario',
      },
      estado: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'Activo',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
    });

    await queryInterface.addConstraint('Usuario', {
      fields: ['rol'],
      type: 'check',
      name: 'check_rol_usuario',
      where: {
        rol: ['Administrador', 'Usuario'],
      },
    });

    await queryInterface.addConstraint('Usuario', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_usuario',
      where: {
        estado: ['Activo', 'Inactivo'],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuario');
  },
};

