'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrdenCompraDetalle', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ordenCompraId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'OrdenCompra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      articuloId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Articulo',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      cantidad: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
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
      costoUnitario: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('OrdenCompraDetalle', ['ordenCompraId']);
    await queryInterface.addIndex('OrdenCompraDetalle', ['articuloId']);
    await queryInterface.addIndex('OrdenCompraDetalle', ['unidadMedidaId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrdenCompraDetalle');
  },
};

