const sequelize = require('../config/database');

const Departamento = require('./Departamento');
const UnidadMedida = require('./UnidadMedida');
const Proveedor = require('./Proveedor');
const Articulo = require('./Articulo');
const OrdenCompra = require('./OrdenCompra');
const OrdenCompraDetalle = require('./OrdenCompraDetalle');
const AsientoContable = require('./AsientoContable');

// Definir relaciones

// Articulo -> UnidadMedida (Many-to-One)
Articulo.belongsTo(UnidadMedida, {
  foreignKey: 'unidadMedidaId',
  as: 'unidadMedida',
});
UnidadMedida.hasMany(Articulo, {
  foreignKey: 'unidadMedidaId',
  as: 'articulos',
});

// OrdenCompra -> Departamento (Many-to-One)
OrdenCompra.belongsTo(Departamento, {
  foreignKey: 'departamentoId',
  as: 'departamento',
});
Departamento.hasMany(OrdenCompra, {
  foreignKey: 'departamentoId',
  as: 'ordenesCompra',
});

// OrdenCompra -> Proveedor (Many-to-One)
OrdenCompra.belongsTo(Proveedor, {
  foreignKey: 'proveedorId',
  as: 'proveedor',
});
Proveedor.hasMany(OrdenCompra, {
  foreignKey: 'proveedorId',
  as: 'ordenesCompra',
});

// OrdenCompra -> OrdenCompraDetalle (One-to-Many)
OrdenCompra.hasMany(OrdenCompraDetalle, {
  foreignKey: 'ordenCompraId',
  as: 'detalles',
});
OrdenCompraDetalle.belongsTo(OrdenCompra, {
  foreignKey: 'ordenCompraId',
  as: 'ordenCompra',
});

// OrdenCompraDetalle -> Articulo (Many-to-One)
OrdenCompraDetalle.belongsTo(Articulo, {
  foreignKey: 'articuloId',
  as: 'articulo',
});
Articulo.hasMany(OrdenCompraDetalle, {
  foreignKey: 'articuloId',
  as: 'detallesOrdenCompra',
});

// OrdenCompraDetalle -> UnidadMedida (Many-to-One)
OrdenCompraDetalle.belongsTo(UnidadMedida, {
  foreignKey: 'unidadMedidaId',
  as: 'unidadMedida',
});
UnidadMedida.hasMany(OrdenCompraDetalle, {
  foreignKey: 'unidadMedidaId',
  as: 'detallesOrdenCompra',
});

// AsientoContable -> OrdenCompra (Many-to-One, nullable)
AsientoContable.belongsTo(OrdenCompra, {
  foreignKey: 'ordenCompraId',
  as: 'ordenCompra',
});
OrdenCompra.hasMany(AsientoContable, {
  foreignKey: 'ordenCompraId',
  as: 'asientosContables',
});

module.exports = {
  sequelize,
  Departamento,
  UnidadMedida,
  Proveedor,
  Articulo,
  OrdenCompra,
  OrdenCompraDetalle,
  AsientoContable,
};

