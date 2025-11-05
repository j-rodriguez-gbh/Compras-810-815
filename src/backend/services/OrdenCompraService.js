const OrdenCompraRepository = require('../repositories/OrdenCompraRepository');
const DepartamentoRepository = require('../repositories/DepartamentoRepository');
const ProveedorRepository = require('../repositories/ProveedorRepository');
const ArticuloRepository = require('../repositories/ArticuloRepository');
const UnidadMedidaRepository = require('../repositories/UnidadMedidaRepository');
const { isValidTransition, getNextStates } = require('../stateMachines/ordenCompraStateMachine');
const { Op } = require('sequelize');

class OrdenCompraService {
  async getAll() {
    return await OrdenCompraRepository.findAll();
  }

  async getById(id) {
    const ordenCompra = await OrdenCompraRepository.findById(id, {
      include: [
        'departamento',
        'proveedor',
        {
          association: 'detalles',
          include: ['articulo', 'unidadMedida'],
        },
      ],
    });
    if (!ordenCompra) {
      throw new Error('Orden de compra no encontrada');
    }
    return ordenCompra;
  }

  async create(data) {
    const departamento = await DepartamentoRepository.findById(data.departamentoId);
    if (!departamento) {
      throw new Error('Departamento no encontrado');
    }
    if (departamento.estado !== 'Activo') {
      throw new Error('El departamento debe estar activo');
    }

    const proveedor = await ProveedorRepository.findById(data.proveedorId);
    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }
    if (proveedor.estado !== 'Activo') {
      throw new Error('El proveedor debe estar activo');
    }

    if (!data.detalles || data.detalles.length === 0) {
      throw new Error('La orden de compra debe tener al menos un detalle');
    }

    for (const detalle of data.detalles) {
      const articulo = await ArticuloRepository.findById(detalle.articuloId);
      if (!articulo) {
        throw new Error(`Artículo con ID ${detalle.articuloId} no encontrado`);
      }
      if (articulo.estado !== 'Activo') {
        throw new Error(`El artículo ${articulo.descripcion} debe estar activo`);
      }

      const unidadMedida = await UnidadMedidaRepository.findById(detalle.unidadMedidaId);
      if (!unidadMedida) {
        throw new Error(`Unidad de medida con ID ${detalle.unidadMedidaId} no encontrada`);
      }
      if (unidadMedida.estado !== 'Activo') {
        throw new Error(`La unidad de medida debe estar activa`);
      }

      if (parseFloat(detalle.cantidad) <= 0) {
        throw new Error('La cantidad debe ser mayor a cero');
      }
      if (parseFloat(detalle.costoUnitario) <= 0) {
        throw new Error('El costo unitario debe ser mayor a cero');
      }
    }

    const numeroOrden = await this.generarNumeroOrden();
    data.numeroOrden = numeroOrden;

    return await OrdenCompraRepository.create(data);
  }

  async update(id, data) {
    const ordenCompra = await this.getById(id);
    
    // Validar que el estado sea válido si se proporciona
    // Permitir cambiar a cualquier estado desde el formulario de edición
    // Esto permite corregir errores sin restricciones del state machine
    if (data.estado) {
      const estadosValidos = ['Pendiente', 'Aprobada', 'Rechazada', 'Enviada'];
      const estadoNormalizado = data.estado.trim();
      
      if (!estadosValidos.includes(estadoNormalizado)) {
        throw new Error(`Estado inválido: ${estadoNormalizado}. Estados válidos: ${estadosValidos.join(', ')}`);
      }
      
      data.estado = estadoNormalizado;
    }

    if (data.departamentoId) {
      const departamento = await DepartamentoRepository.findById(data.departamentoId);
      if (!departamento || departamento.estado !== 'Activo') {
        throw new Error('El departamento debe estar activo');
      }
    }

    if (data.proveedorId) {
      const proveedor = await ProveedorRepository.findById(data.proveedorId);
      if (!proveedor || proveedor.estado !== 'Activo') {
        throw new Error('El proveedor debe estar activo');
      }
    }

    if (data.detalles) {
      if (data.detalles.length === 0) {
        throw new Error('La orden de compra debe tener al menos un detalle');
      }

      for (const detalle of data.detalles) {
        const articulo = await ArticuloRepository.findById(detalle.articuloId);
        if (!articulo || articulo.estado !== 'Activo') {
          throw new Error(`El artículo debe estar activo`);
        }

        if (parseFloat(detalle.cantidad) <= 0) {
          throw new Error('La cantidad debe ser mayor a cero');
        }
        if (parseFloat(detalle.costoUnitario) <= 0) {
          throw new Error('El costo unitario debe ser mayor a cero');
        }
      }
    }

    return await OrdenCompraRepository.update(id, data);
  }

  async delete(id) {
    const ordenCompra = await this.getById(id);
    
    // Solo se pueden eliminar órdenes que no estén enviadas
    // Las órdenes rechazadas pueden eliminarse
    if (ordenCompra.estado === 'Enviada') {
      throw new Error('No se puede eliminar una orden de compra ya enviada');
    }

    return await OrdenCompraRepository.delete(id);
  }

  async consultarPorCriterios(criterios) {
    return await OrdenCompraRepository.findByCriterios(criterios);
  }

  /**
   * Cambia el estado de una orden de compra usando la máquina de estados
   * @param {number} id - ID de la orden de compra
   * @param {string} nuevoEstado - Nuevo estado deseado
   * @returns {Object} - Orden de compra actualizada
   */
  async cambiarEstado(id, nuevoEstado) {
    const ordenCompra = await this.getById(id);
    
    // Normalizar el estado (trim y capitalizar)
    const estadoNormalizado = nuevoEstado?.trim();
    
    // Validar que el nuevo estado sea válido
    const estadosValidos = ['Pendiente', 'Aprobada', 'Rechazada', 'Enviada'];
    if (!estadoNormalizado || !estadosValidos.includes(estadoNormalizado)) {
      throw new Error(`Estado inválido: ${estadoNormalizado}. Estados válidos: ${estadosValidos.join(', ')}`);
    }
    
    // Si el estado no cambia, retornar la orden sin modificar
    if (ordenCompra.estado === estadoNormalizado) {
      return ordenCompra;
    }
    
    // Validar transición usando la máquina de estados
    if (!isValidTransition(ordenCompra.estado, estadoNormalizado)) {
      const estadosPosibles = getNextStates(ordenCompra.estado);
      throw new Error(
        `No se puede cambiar el estado de "${ordenCompra.estado}" a "${estadoNormalizado}". ` +
        `Estados posibles: ${estadosPosibles.length > 0 ? estadosPosibles.join(', ') : 'ninguno (estado final)'}`
      );
    }
    
    // Actualizar el estado
    return await OrdenCompraRepository.update(id, { estado: estadoNormalizado });
  }

  /**
   * Obtiene los estados posibles a los que puede transicionar una orden
   * @param {number} id - ID de la orden de compra
   * @returns {string[]} - Array de estados posibles
   */
  async getEstadosPosibles(id) {
    const ordenCompra = await this.getById(id);
    return getNextStates(ordenCompra.estado);
  }

  async generarNumeroOrden() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    
    const ultimaOrden = await OrdenCompraRepository.findAll({
      where: {
        numeroOrden: {
          [Op.like]: `OC-${año}${mes}-%`,
        },
      },
      order: [['numeroOrden', 'DESC']],
      limit: 1,
    });

    let secuencia = 1;
    if (ultimaOrden.length > 0) {
      const ultimoNumero = ultimaOrden[0].numeroOrden;
      const ultimaSecuencia = parseInt(ultimoNumero.split('-')[2]);
      secuencia = ultimaSecuencia + 1;
    }

    return `OC-${año}${mes}-${String(secuencia).padStart(4, '0')}`;
  }
}

module.exports = new OrdenCompraService();

