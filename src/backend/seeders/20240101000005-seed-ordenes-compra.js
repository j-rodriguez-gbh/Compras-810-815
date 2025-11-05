'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar datos existentes para insertar los nuevos (primero los detalles, luego las órdenes)
    await queryInterface.bulkDelete('OrdenCompraDetalle', null, {});
    await queryInterface.bulkDelete('OrdenCompra', null, {});
    
    // Obtener IDs de departamentos, proveedores, artículos y unidades de medida
    const departamentos = await queryInterface.sequelize.query(
      "SELECT id FROM Departamento ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const proveedores = await queryInterface.sequelize.query(
      "SELECT id FROM Proveedor ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const articulos = await queryInterface.sequelize.query(
      "SELECT id FROM Articulo ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const unidadesMedida = await queryInterface.sequelize.query(
      "SELECT id FROM UnidadMedida ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Obtener IDs de artículos con sus unidades de medida
    const articulosConUnidad = await queryInterface.sequelize.query(
      "SELECT a.id, a.unidadMedidaId FROM Articulo a ORDER BY a.id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const deptId = departamentos[0]?.id || 1;
    const dept2Id = departamentos[1]?.id || 2;
    const dept3Id = departamentos[2]?.id || 3;
    const dept4Id = departamentos[4]?.id || 5;
    
    const provId = proveedores[0]?.id || 1;
    const prov2Id = proveedores[1]?.id || 2;
    const prov3Id = proveedores[2]?.id || 3;
    const prov4Id = proveedores[4]?.id || 5;
    
    const art1Id = articulosConUnidad[0]?.id || 1;
    const art2Id = articulosConUnidad[1]?.id || 2;
    const art3Id = articulosConUnidad[2]?.id || 3;
    const art4Id = articulosConUnidad[4]?.id || 5;
    const art5Id = articulosConUnidad[10]?.id || 11;
    const art6Id = articulosConUnidad[11]?.id || 12;
    const art7Id = articulosConUnidad[14]?.id || 15;
    const art8Id = articulosConUnidad[19]?.id || 20;
    const art9Id = articulosConUnidad[20]?.id || 21;
    
    const unidad1Id = articulosConUnidad[0]?.unidadMedidaId || 1;
    const unidad2Id = articulosConUnidad[1]?.unidadMedidaId || 1;
    const unidad3Id = articulosConUnidad[2]?.unidadMedidaId || 1;
    const unidad4Id = articulosConUnidad[4]?.unidadMedidaId || 1;
    const unidad5Id = articulosConUnidad[10]?.unidadMedidaId || 1;
    const unidad6Id = articulosConUnidad[11]?.unidadMedidaId || 1;
    const unidad7Id = articulosConUnidad[14]?.unidadMedidaId || 1;
    const unidad8Id = articulosConUnidad[19]?.unidadMedidaId || 4;
    const unidad9Id = articulosConUnidad[20]?.unidadMedidaId || 4;

    // Insertar órdenes de compra
    const fechaHoy = new Date();
    const fechaAyer = new Date(fechaHoy);
    fechaAyer.setDate(fechaAyer.getDate() - 1);
    const fechaAntes = new Date(fechaHoy);
    fechaAntes.setDate(fechaAntes.getDate() - 5);
    const fechaSemana = new Date(fechaHoy);
    fechaSemana.setDate(fechaSemana.getDate() - 7);
    const fechaMes = new Date(fechaHoy);
    fechaMes.setDate(fechaMes.getDate() - 30);

    // Usar inserción directa con SQL para evitar validaciones de Sequelize
    await queryInterface.sequelize.query(`
      INSERT INTO OrdenCompra (numeroOrden, fechaOrden, estado, departamentoId, proveedorId, createdAt, updatedAt) VALUES
      (N'OC-202401-0001', '${fechaMes.toISOString().split('T')[0]}', N'Enviada', ${deptId}, ${provId}, GETDATE(), GETDATE()),
      (N'OC-202401-0002', '${fechaSemana.toISOString().split('T')[0]}', N'Aprobada', ${dept2Id}, ${prov2Id}, GETDATE(), GETDATE()),
      (N'OC-202401-0003', '${fechaAntes.toISOString().split('T')[0]}', N'Aprobada', ${dept3Id}, ${prov3Id}, GETDATE(), GETDATE()),
      (N'OC-202401-0004', '${fechaAyer.toISOString().split('T')[0]}', N'Pendiente', ${dept4Id}, ${prov4Id}, GETDATE(), GETDATE()),
      (N'OC-202401-0005', '${fechaAyer.toISOString().split('T')[0]}', N'Pendiente', ${deptId}, ${prov2Id}, GETDATE(), GETDATE()),
      (N'OC-202401-0006', '${fechaHoy.toISOString().split('T')[0]}', N'Pendiente', ${dept2Id}, ${provId}, GETDATE(), GETDATE()),
      (N'OC-202401-0007', '${fechaHoy.toISOString().split('T')[0]}', N'Rechazada', ${dept3Id}, ${prov4Id}, GETDATE(), GETDATE())
    `);

    // Obtener los IDs de las órdenes recién insertadas
    const ordenes = await queryInterface.sequelize.query(
      "SELECT id, numeroOrden FROM OrdenCompra ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const orden1Id = ordenes[0]?.id;
    const orden2Id = ordenes[1]?.id;
    const orden3Id = ordenes[2]?.id;
    const orden4Id = ordenes[3]?.id;
    const orden5Id = ordenes[4]?.id;
    const orden6Id = ordenes[5]?.id;
    const orden7Id = ordenes[6]?.id;

    // Insertar detalles de las órdenes usando SQL directo
    const detallesSQL = [];
    
    if (orden1Id) {
      detallesSQL.push(`(${orden1Id}, ${art1Id}, 10.00, ${unidad1Id}, 250.00, 2500.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden1Id}, ${art2Id}, 50.00, ${unidad2Id}, 15.00, 750.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden1Id}, ${art3Id}, 30.00, ${unidad3Id}, 12.50, 375.00, GETDATE(), GETDATE())`);
    }
    
    if (orden2Id) {
      detallesSQL.push(`(${orden2Id}, ${art5Id}, 5.00, ${unidad5Id}, 2400.00, 12000.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden2Id}, ${art6Id}, 5.00, ${unidad6Id}, 1800.00, 9000.00, GETDATE(), GETDATE())`);
    }
    
    if (orden3Id) {
      detallesSQL.push(`(${orden3Id}, ${art4Id}, 20.00, ${unidad4Id}, 45.00, 900.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden3Id}, ${art7Id}, 15.00, ${unidad7Id}, 35.00, 525.00, GETDATE(), GETDATE())`);
    }
    
    if (orden4Id) {
      detallesSQL.push(`(${orden4Id}, ${art8Id}, 25.00, ${unidad8Id}, 120.00, 3000.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden4Id}, ${art9Id}, 15.00, ${unidad9Id}, 95.00, 1425.00, GETDATE(), GETDATE())`);
    }
    
    if (orden5Id) {
      detallesSQL.push(`(${orden5Id}, ${art1Id}, 8.00, ${unidad1Id}, 245.00, 1960.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden5Id}, ${art2Id}, 100.00, ${unidad2Id}, 14.50, 1450.00, GETDATE(), GETDATE())`);
      detallesSQL.push(`(${orden5Id}, ${art3Id}, 75.00, ${unidad3Id}, 12.00, 900.00, GETDATE(), GETDATE())`);
    }
    
    if (orden6Id) {
      detallesSQL.push(`(${orden6Id}, ${art5Id}, 3.00, ${unidad5Id}, 2500.00, 7500.00, GETDATE(), GETDATE())`);
    }
    
    if (orden7Id) {
      detallesSQL.push(`(${orden7Id}, ${art6Id}, 2.00, ${unidad6Id}, 1900.00, 3800.00, GETDATE(), GETDATE())`);
    }
    
    if (detallesSQL.length > 0) {
      await queryInterface.sequelize.query(`
        INSERT INTO OrdenCompraDetalle (ordenCompraId, articuloId, cantidad, unidadMedidaId, costoUnitario, subtotal, createdAt, updatedAt) VALUES
        ${detallesSQL.join(',\n        ')}
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrdenCompraDetalle', null, {});
    await queryInterface.bulkDelete('OrdenCompra', null, {});
  },
};

