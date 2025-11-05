'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrdenCompra', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numeroOrden: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      fechaOrden: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CAST(GETDATE() AS DATE)'),
      },
      estado: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Departamento',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      proveedorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Proveedor',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
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

    await queryInterface.addConstraint('OrdenCompra', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_orden_compra',
      where: {
        estado: ['Pendiente', 'Aprobada', 'Rechazada', 'Enviada'],
      },
    });

    await queryInterface.addIndex('OrdenCompra', ['departamentoId']);
    await queryInterface.addIndex('OrdenCompra', ['proveedorId']);
    await queryInterface.addIndex('OrdenCompra', ['fechaOrden']);
    await queryInterface.addIndex('OrdenCompra', ['numeroOrden']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrdenCompra');
  },
};

