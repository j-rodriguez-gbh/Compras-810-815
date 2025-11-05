'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Articulo', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      marca: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      unidadMedidaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'UnidadMedida',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      existencia: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint('Articulo', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_articulo',
      where: {
        estado: ['Activo', 'Inactivo'],
      },
    });

    await queryInterface.addIndex('Articulo', ['unidadMedidaId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Articulo');
  },
};

