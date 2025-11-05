const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Articulo = sequelize.define(
  'Articulo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    marca: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unidadMedidaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UnidadMedida',
        key: 'id',
      },
    },
    existencia: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
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
    tableName: 'Articulo',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = Articulo;

