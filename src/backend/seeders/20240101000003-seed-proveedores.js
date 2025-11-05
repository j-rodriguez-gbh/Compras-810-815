'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen proveedores
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM Proveedor",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing && existing.count > 0) {
      // Si ya existen, no eliminar porque hay dependencias
      console.log('Proveedores ya existen, saltando inserción...');
      return;
    }
    
    // Usar inserción directa con SQL para evitar validaciones de Sequelize
    await queryInterface.sequelize.query(`
      INSERT INTO Proveedor (cedulaRNC, nombreComercial, estado, createdAt, updatedAt) VALUES
      (N'001-1234567-8', N'Suministros Generales S.A.', N'Activo', GETDATE(), GETDATE()),
      (N'131-123456-7', N'Tecnología Avanzada SRL', N'Activo', GETDATE(), GETDATE()),
      (N'001-2345678-9', N'Materiales de Oficina Express', N'Activo', GETDATE(), GETDATE()),
      (N'131-234567-8', N'Equipos y Herramientas SRL', N'Activo', GETDATE(), GETDATE()),
      (N'001-3456789-0', N'Insumos Industriales S.A.', N'Activo', GETDATE(), GETDATE()),
      (N'001-4567890-1', N'Electrónica y Componentes S.A.', N'Activo', GETDATE(), GETDATE()),
      (N'131-345678-9', N'Muebles y Decoración SRL', N'Activo', GETDATE(), GETDATE()),
      (N'001-5678901-2', N'Limpieza Profesional S.A.', N'Activo', GETDATE(), GETDATE()),
      (N'131-456789-0', N'Seguridad y Vigilancia SRL', N'Activo', GETDATE(), GETDATE()),
      (N'001-6789012-3', N'Papelería y Librería Premium', N'Activo', GETDATE(), GETDATE()),
      (N'131-567890-1', N'Catering Empresarial SRL', N'Activo', GETDATE(), GETDATE()),
      (N'001-7890123-4', N'Transporte y Logística S.A.', N'Inactivo', GETDATE(), GETDATE()),
      (N'131-678901-2', N'Proveedor Temporal SRL', N'Inactivo', GETDATE(), GETDATE())
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Proveedor', null, {});
  },
};

