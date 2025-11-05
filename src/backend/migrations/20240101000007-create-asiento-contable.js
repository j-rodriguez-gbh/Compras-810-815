'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AsientoContable', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      identificadorAsiento: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tipoInventarioId: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      cuentaContable: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tipoMovimiento: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      fechaAsiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CAST(GETDATE() AS DATE)'),
      },
      montoAsiento: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      estado: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
      ordenCompraId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'OrdenCompra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addConstraint('AsientoContable', {
      fields: ['tipoMovimiento'],
      type: 'check',
      name: 'check_tipo_movimiento',
      where: {
        tipoMovimiento: ['DB', 'CR'],
      },
    });

    await queryInterface.addConstraint('AsientoContable', {
      fields: ['estado'],
      type: 'check',
      name: 'check_estado_asiento',
      where: {
        estado: ['Pendiente', 'Enviado', 'Confirmado', 'Error'],
      },
    });

    await queryInterface.addIndex('AsientoContable', ['ordenCompraId']);
    await queryInterface.addIndex('AsientoContable', ['identificadorAsiento']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AsientoContable');
  },
};

