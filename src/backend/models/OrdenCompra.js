const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenCompra = sequelize.define(
  'OrdenCompra',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroOrden: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    fechaOrden: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Pendiente',
      validate: {
        isIn: [['Pendiente', 'Aprobada', 'Rechazada', 'Enviada']],
      },
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Departamento',
        key: 'id',
      },
    },
    proveedorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Proveedor',
        key: 'id',
      },
    },
  },
  {
    tableName: 'OrdenCompra',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = OrdenCompra;

