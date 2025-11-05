'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen artículos
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM Articulo",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing && existing.count > 0) {
      // Si ya existen, no eliminar porque hay dependencias
      console.log('Artículos ya existen, saltando inserción...');
      return;
    }
    
    // Primero obtenemos los IDs de las unidades de medida
    const unidadesMedida = await queryInterface.sequelize.query(
      "SELECT id, descripcion FROM UnidadMedida ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const unidadId = unidadesMedida.find(u => u.descripcion === 'Unidad')?.id || unidadesMedida[0]?.id || 1;
    const kgId = unidadesMedida.find(u => u.descripcion === 'Kilogramo')?.id || unidadesMedida[1]?.id || 2;
    const gramoId = unidadesMedida.find(u => u.descripcion === 'Gramo')?.id || unidadesMedida[2]?.id || 3;
    const litroId = unidadesMedida.find(u => u.descripcion === 'Litro')?.id || unidadesMedida[3]?.id || 4;
    const metroId = unidadesMedida.find(u => u.descripcion === 'Metro')?.id || unidadesMedida[4]?.id || 5;
    const cajaId = unidadesMedida.find(u => u.descripcion === 'Caja')?.id || unidadesMedida[5]?.id || 6;
    const paqueteId = unidadesMedida.find(u => u.descripcion === 'Paquete')?.id || unidadesMedida[6]?.id || 7;
    const cmId = unidadesMedida.find(u => u.descripcion === 'Centímetro')?.id || unidadesMedida[7]?.id || 8;
    const mlId = unidadesMedida.find(u => u.descripcion === 'Mililitro')?.id || unidadesMedida[8]?.id || 9;
    const docenaId = unidadesMedida.find(u => u.descripcion === 'Docena')?.id || unidadesMedida[9]?.id || 10;
    const resmaId = unidadesMedida.find(u => u.descripcion === 'Resma')?.id || unidadesMedida[10]?.id || 11;

    // Usar inserción directa con SQL para evitar validaciones de Sequelize
    await queryInterface.sequelize.query(`
      INSERT INTO Articulo (descripcion, marca, unidadMedidaId, existencia, estado, createdAt, updatedAt) VALUES
      (N'Papel A4', N'Xerox', ${paqueteId}, 50.00, N'Activo', GETDATE(), GETDATE()),
      (N'Lápiz HB', N'Faber-Castell', ${unidadId}, 200.00, N'Activo', GETDATE(), GETDATE()),
      (N'Bolígrafo Azul', N'Bic', ${unidadId}, 150.00, N'Activo', GETDATE(), GETDATE()),
      (N'Bolígrafo Negro', N'Bic', ${unidadId}, 180.00, N'Activo', GETDATE(), GETDATE()),
      (N'Carpeta de Archivo', N'Wilson Jones', ${unidadId}, 75.00, N'Activo', GETDATE(), GETDATE()),
      (N'Resma de Papel', N'Xerox', ${resmaId}, 30.00, N'Activo', GETDATE(), GETDATE()),
      (N'Borrador', N'Staedtler', ${unidadId}, 100.00, N'Activo', GETDATE(), GETDATE()),
      (N'Marcador Permanente', N'Sharpie', ${unidadId}, 60.00, N'Activo', GETDATE(), GETDATE()),
      (N'Grapas', N'Staples', ${cajaId}, 25.00, N'Activo', GETDATE(), GETDATE()),
      (N'Clips Metálicos', N'Staples', ${cajaId}, 40.00, N'Activo', GETDATE(), GETDATE()),
      (N'Mouse Inalámbrico', N'Logitech', ${unidadId}, 25.00, N'Activo', GETDATE(), GETDATE()),
      (N'Teclado USB', N'Microsoft', ${unidadId}, 20.00, N'Activo', GETDATE(), GETDATE()),
      (N'Monitor 24 pulgadas', N'Dell', ${unidadId}, 15.00, N'Activo', GETDATE(), GETDATE()),
      (N'Monitor 27 pulgadas', N'LG', ${unidadId}, 10.00, N'Activo', GETDATE(), GETDATE()),
      (N'Cable HDMI', N'Amazon Basics', ${unidadId}, 40.00, N'Activo', GETDATE(), GETDATE()),
      (N'Memoria USB 32GB', N'SanDisk', ${unidadId}, 50.00, N'Activo', GETDATE(), GETDATE()),
      (N'Memoria USB 64GB', N'SanDisk', ${unidadId}, 30.00, N'Activo', GETDATE(), GETDATE()),
      (N'Impresora Láser', N'HP', ${unidadId}, 8.00, N'Activo', GETDATE(), GETDATE()),
      (N'Router WiFi', N'TP-Link', ${unidadId}, 12.00, N'Activo', GETDATE(), GETDATE()),
      (N'Detergente Líquido', N'Clorox', ${litroId}, 45.00, N'Activo', GETDATE(), GETDATE()),
      (N'Desinfectante', N'Lysol', ${litroId}, 35.00, N'Activo', GETDATE(), GETDATE()),
      (N'Papel Toalla', N'Scott', ${paqueteId}, 80.00, N'Activo', GETDATE(), GETDATE()),
      (N'Trapos de Microfibra', N'Generic', ${unidadId}, 120.00, N'Activo', GETDATE(), GETDATE()),
      (N'Cable Eléctrico', N'General Electric', ${metroId}, 200.00, N'Activo', GETDATE(), GETDATE()),
      (N'Tornillos', N'Generic', ${docenaId}, 50.00, N'Activo', GETDATE(), GETDATE()),
      (N'Pintura Blanca', N'Sherwin Williams', ${litroId}, 25.00, N'Activo', GETDATE(), GETDATE()),
      (N'Disco Duro Externo Antiguo', N'Seagate', ${unidadId}, 5.00, N'Inactivo', GETDATE(), GETDATE()),
      (N'Impresora de Matriz de Puntos', N'Epson', ${unidadId}, 2.00, N'Inactivo', GETDATE(), GETDATE()),
      (N'Papel Continuo', N'Generic', ${paqueteId}, 10.00, N'Inactivo', GETDATE(), GETDATE())
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Articulo', null, {});
  },
};

