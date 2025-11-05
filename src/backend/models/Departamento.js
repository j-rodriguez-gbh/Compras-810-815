const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Departamento = sequelize.define(
  'Departamento',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
    tableName: 'Departamento',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = Departamento;

