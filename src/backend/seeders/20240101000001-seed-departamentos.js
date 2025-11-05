'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen departamentos
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM Departamento",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing && existing.count > 0) {
      console.log('Departamentos ya existen, saltando inserción...');
      return;
    }
    
    // Eliminar datos existentes para insertar los nuevos
    await queryInterface.bulkDelete('Departamento', null, {});
    
    // Usar inserción directa con SQL para evitar validaciones de Sequelize
    await queryInterface.sequelize.query(`
      INSERT INTO Departamento (nombre, estado, createdAt, updatedAt) VALUES
      (N'Recursos Humanos', N'Activo', GETDATE(), GETDATE()),
      (N'Contabilidad', N'Activo', GETDATE(), GETDATE()),
      (N'Informática', N'Activo', GETDATE(), GETDATE()),
      (N'Administración', N'Activo', GETDATE(), GETDATE()),
      (N'Mantenimiento', N'Activo', GETDATE(), GETDATE()),
      (N'Ventas', N'Activo', GETDATE(), GETDATE()),
      (N'Marketing', N'Activo', GETDATE(), GETDATE()),
      (N'Producción', N'Activo', GETDATE(), GETDATE()),
      (N'Logística', N'Activo', GETDATE(), GETDATE()),
      (N'Calidad', N'Activo', GETDATE(), GETDATE()),
      (N'Seguridad', N'Inactivo', GETDATE(), GETDATE()),
      (N'Departamento Temporal', N'Inactivo', GETDATE(), GETDATE())
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Departamento', null, {});
  },
};

