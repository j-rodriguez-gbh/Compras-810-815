const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { validateCedulaRNC } = require('../utils/validators');

const Proveedor = sequelize.define(
  'Proveedor',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cedulaRNC: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
        isValidCedulaRNC(value) {
          if (!validateCedulaRNC(value)) {
            throw new Error('La cédula/RNC no es válida. Debe ser una cédula de 11 dígitos o un RNC de 9 u 11 dígitos válido');
          }
        },
      },
    },
    nombreComercial: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Activo',
      validate: {
        isIn: [['Activo', 'Inactivo']],
      },
    },
  },
  {
    tableName: 'Proveedor',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = Proveedor;

