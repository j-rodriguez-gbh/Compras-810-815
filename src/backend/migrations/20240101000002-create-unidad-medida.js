'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UnidadMedida', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descripcion: {
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

    await queryInterface.addConstraint('UnidadMedida', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_unidad_medida',
      where: {
        estado: ['Activo', 'Inactivo'],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UnidadMedida');
  },
};

