const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenCompraDetalle = sequelize.define(
  'OrdenCompraDetalle',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ordenCompraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'OrdenCompra',
        key: 'id',
      },
    },
    articuloId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Articulo',
        key: 'id',
      },
    },
    cantidad: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    unidadMedidaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UnidadMedida',
        key: 'id',
      },
    },
    costoUnitario: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'OrdenCompraDetalle',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = OrdenCompraDetalle;

