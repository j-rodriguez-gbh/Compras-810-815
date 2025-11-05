'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Proveedor', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cedulaRNC: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombreComercial: {
        type: Sequelize.STRING(255),
        allowNull: false,
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

    await queryInterface.addConstraint('Proveedor', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_proveedor',
      where: {
        estado: ['Activo', 'Inactivo'],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Proveedor');
  },
};

