const { OrdenCompra, OrdenCompraDetalle } = require('../models/index');
const { Op } = require('sequelize');

class OrdenCompraRepository {
  async findAll(options = {}) {
    // Si no se especifica include, usar el default con detalles y sus relaciones
    const includeOptions = options.include || [
      'departamento',
      'proveedor',
      {
        association: 'detalles',
        include: ['articulo', 'unidadMedida'],
      },
    ];
    
    return await OrdenCompra.findAll({
      ...options,
      include: includeOptions,
      order: [['fechaOrden', 'DESC'], ['numeroOrden', 'DESC']],
    });
  }

  async findById(id, options = {}) {
    return await OrdenCompra.findByPk(id, options);
  }

  async create(data) {
    const { detalles, ...ordenData } = data;
    const ordenCompra = await OrdenCompra.create(ordenData);
    
    if (detalles && detalles.length > 0) {
      const detallesData = detalles.map(detalle => ({
        ...detalle,
        ordenCompraId: ordenCompra.id,
        subtotal: parseFloat(detalle.cantidad) * parseFloat(detalle.costoUnitario),
      }));
      await OrdenCompraDetalle.bulkCreate(detallesData);
    }
    
    return await this.findById(ordenCompra.id, {
      include: ['detalles', 'departamento', 'proveedor'],
    });
  }

  async update(id, data) {
    const { detalles, ...ordenData } = data;
    const ordenCompra = await OrdenCompra.findByPk(id);
    if (!ordenCompra) {
      return null;
    }
    
    await ordenCompra.update(ordenData);
    
    if (detalles) {
      await OrdenCompraDetalle.destroy({ where: { ordenCompraId: id } });
      const detallesData = detalles.map(detalle => ({
        ...detalle,
        ordenCompraId: id,
        subtotal: parseFloat(detalle.cantidad) * parseFloat(detalle.costoUnitario),
      }));
      await OrdenCompraDetalle.bulkCreate(detallesData);
    }
    
    return await this.findById(id, {
      include: ['detalles', 'departamento', 'proveedor'],
    });
  }

  async delete(id) {
    const ordenCompra = await OrdenCompra.findByPk(id);
    if (!ordenCompra) {
      return null;
    }
    return await ordenCompra.destroy();
  }

  async findByNumeroOrden(numeroOrden) {
    return await OrdenCompra.findOne({
      where: { numeroOrden },
    });
  }

  async findByCriterios(criterios) {
    const where = {};
    
    if (criterios.departamentoId) {
      where.departamentoId = criterios.departamentoId;
    }
    
    if (criterios.proveedorId) {
      where.proveedorId = criterios.proveedorId;
    }
    
    if (criterios.estado) {
      where.estado = criterios.estado;
    }
    
    if (criterios.fechaDesde || criterios.fechaHasta) {
      where.fechaOrden = {};
      if (criterios.fechaDesde) {
        where.fechaOrden[Op.gte] = criterios.fechaDesde;
      }
      if (criterios.fechaHasta) {
        where.fechaOrden[Op.lte] = criterios.fechaHasta;
      }
    }
    
    return await OrdenCompra.findAll({
      where,
      include: [
        'departamento',
        'proveedor',
        {
          association: 'detalles',
          include: ['articulo', 'unidadMedida'],
        },
      ],
      order: [['fechaOrden', 'DESC']],
    });
  }

  async count() {
    return await OrdenCompra.count();
  }
}

module.exports = new OrdenCompraRepository();

