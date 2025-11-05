'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen unidades de medida
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM UnidadMedida",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing && existing.count > 0) {
      // Si ya existen, no eliminar porque hay dependencias
      console.log('Unidades de medida ya existen, saltando inserción...');
      return;
    }
    
    // Usar inserción directa con SQL para evitar validaciones de Sequelize
    await queryInterface.sequelize.query(`
      INSERT INTO UnidadMedida (descripcion, estado, createdAt, updatedAt) VALUES
      (N'Unidad', N'Activo', GETDATE(), GETDATE()),
      (N'Kilogramo', N'Activo', GETDATE(), GETDATE()),
      (N'Gramo', N'Activo', GETDATE(), GETDATE()),
      (N'Litro', N'Activo', GETDATE(), GETDATE()),
      (N'Metro', N'Activo', GETDATE(), GETDATE()),
      (N'Caja', N'Activo', GETDATE(), GETDATE()),
      (N'Paquete', N'Activo', GETDATE(), GETDATE()),
      (N'Centímetro', N'Activo', GETDATE(), GETDATE()),
      (N'Mililitro', N'Activo', GETDATE(), GETDATE()),
      (N'Docena', N'Activo', GETDATE(), GETDATE()),
      (N'Resma', N'Activo', GETDATE(), GETDATE()),
      (N'Galón', N'Inactivo', GETDATE(), GETDATE()),
      (N'Onza', N'Inactivo', GETDATE(), GETDATE())
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UnidadMedida', null, {});
  },
};

