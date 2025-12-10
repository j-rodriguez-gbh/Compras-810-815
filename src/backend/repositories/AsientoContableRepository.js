const { AsientoContable, OrdenCompra } = require('../models/index');
const { Op } = require('sequelize');

class AsientoContableRepository {
  async findAll(options = {}) {
    const includeOptions = options.include || [
      {
        model: OrdenCompra,
        as: 'ordenCompra',
        required: false,
      },
    ];

    return await AsientoContable.findAll({
      ...options,
      include: includeOptions,
      order: [['fechaAsiento', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findById(id, options = {}) {
    return await AsientoContable.findByPk(id, {
      ...options,
      include: [
        {
          model: OrdenCompra,
          as: 'ordenCompra',
          required: false,
        },
      ],
    });
  }

  async create(data) {
    return await AsientoContable.create(data);
  }

  async createMany(asientosData) {
    return await AsientoContable.bulkCreate(asientosData);
  }

  async update(id, data) {
    const asiento = await AsientoContable.findByPk(id);
    if (!asiento) {
      return null;
    }
    await asiento.update(data);
    return await this.findById(id);
  }

  async delete(id) {
    const asiento = await AsientoContable.findByPk(id);
    if (!asiento) {
      return null;
    }
    return await asiento.destroy();
  }

  async findByOrdenCompraId(ordenCompraId) {
    return await AsientoContable.findAll({
      where: { ordenCompraId },
      include: [
        {
          model: OrdenCompra,
          as: 'ordenCompra',
          required: false,
        },
      ],
      order: [['fechaAsiento', 'DESC']],
    });
  }

  async findByEstado(estado) {
    return await AsientoContable.findAll({
      where: { estado },
      include: [
        {
          model: OrdenCompra,
          as: 'ordenCompra',
          required: false,
        },
      ],
      order: [['fechaAsiento', 'DESC']],
    });
  }

  async findByFechaRange(fechaDesde, fechaHasta) {
    return await AsientoContable.findAll({
      where: {
        fechaAsiento: {
          [Op.between]: [fechaDesde, fechaHasta],
        },
      },
      include: [
        {
          model: OrdenCompra,
          as: 'ordenCompra',
          required: false,
        },
      ],
      order: [['fechaAsiento', 'DESC']],
    });
  }

  async findByCriterios(criterios) {
    const where = {};

    if (criterios.estado) {
      where.estado = criterios.estado;
    }

    if (criterios.ordenCompraId) {
      where.ordenCompraId = criterios.ordenCompraId;
    }

    if (criterios.fechaDesde || criterios.fechaHasta) {
      where.fechaAsiento = {};
      if (criterios.fechaDesde) {
        where.fechaAsiento[Op.gte] = criterios.fechaDesde;
      }
      if (criterios.fechaHasta) {
        where.fechaAsiento[Op.lte] = criterios.fechaHasta;
      }
    }

    if (criterios.tipoMovimiento) {
      where.tipoMovimiento = criterios.tipoMovimiento;
    }

    return await AsientoContable.findAll({
      where,
      include: [
        {
          model: OrdenCompra,
          as: 'ordenCompra',
          required: false,
        },
      ],
      order: [['fechaAsiento', 'DESC']],
    });
  }

  async count() {
    return await AsientoContable.count();
  }

  async countByEstado(estado) {
    return await AsientoContable.count({
      where: { estado },
    });
  }
}

module.exports = new AsientoContableRepository();

