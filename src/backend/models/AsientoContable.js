const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AsientoContable = sequelize.define(
  'AsientoContable',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    identificadorAsiento: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipoInventarioId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cuentaContable: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tipoMovimiento: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        isIn: [['DB', 'CR']],
      },
    },
    fechaAsiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    montoAsiento: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Pendiente',
      validate: {
        isIn: [['Pendiente', 'Enviado', 'Confirmado', 'Error']],
      },
    },
    ordenCompraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'OrdenCompra',
        key: 'id',
      },
    },
  },
  {
    tableName: 'AsientoContable',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = AsientoContable;

