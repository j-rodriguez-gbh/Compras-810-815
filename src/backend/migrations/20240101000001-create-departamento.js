'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Departamento', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
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

    await queryInterface.addConstraint('Departamento', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_departamento',
      where: {
        estado: ['Activo', 'Inactivo'],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Departamento');
  },
};

