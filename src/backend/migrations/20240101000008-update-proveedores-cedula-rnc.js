'use strict';

const { generateCedula, generateRNC, validateCedulaRNC } = require('../utils/validators');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Mapeo de proveedores existentes con sus nuevos RNCs/Cédulas válidos
    // Basado en los nombres comerciales del seeder original
    const updates = [
      // Suministros Generales S.A. - RNC de 11 dígitos (001-1234567-8)
      { nombre: 'Suministros Generales S.A.', base: '0011234567', type: 'rnc11' },
      // Tecnología Avanzada SRL - RNC de 9 dígitos (131-123456-7)
      { nombre: 'Tecnología Avanzada SRL', base: '13112345', type: 'rnc9' },
      // Materiales de Oficina Express - RNC de 11 dígitos (001-2345678-9)
      { nombre: 'Materiales de Oficina Express', base: '0012345678', type: 'rnc11' },
      // Equipos y Herramientas SRL - RNC de 9 dígitos (131-234567-8)
      { nombre: 'Equipos y Herramientas SRL', base: '13123456', type: 'rnc9' },
      // Insumos Industriales S.A. - RNC de 11 dígitos (001-3456789-0)
      { nombre: 'Insumos Industriales S.A.', base: '0013456789', type: 'rnc11' },
      // Electrónica y Componentes S.A. - RNC de 11 dígitos (001-4567890-1)
      { nombre: 'Electrónica y Componentes S.A.', base: '0014567890', type: 'rnc11' },
      // Muebles y Decoración SRL - RNC de 9 dígitos (131-345678-9)
      { nombre: 'Muebles y Decoración SRL', base: '13134567', type: 'rnc9' },
      // Limpieza Profesional S.A. - RNC de 11 dígitos (001-5678901-2)
      { nombre: 'Limpieza Profesional S.A.', base: '0015678901', type: 'rnc11' },
      // Seguridad y Vigilancia SRL - RNC de 9 dígitos (131-456789-0)
      { nombre: 'Seguridad y Vigilancia SRL', base: '13145678', type: 'rnc9' },
      // Papelería y Librería Premium - RNC de 11 dígitos (001-6789012-3)
      { nombre: 'Papelería y Librería Premium', base: '0016789012', type: 'rnc11' },
      // Catering Empresarial SRL - RNC de 9 dígitos (131-567890-1)
      { nombre: 'Catering Empresarial SRL', base: '13156789', type: 'rnc9' },
      // Transporte y Logística S.A. - RNC de 11 dígitos (001-7890123-4)
      { nombre: 'Transporte y Logística S.A.', base: '0017890123', type: 'rnc11' },
      // Proveedor Temporal SRL - RNC de 9 dígitos (131-678901-2)
      { nombre: 'Proveedor Temporal SRL', base: '13167890', type: 'rnc9' },
    ];

    // Generar los valores válidos y actualizar cada proveedor
    for (const update of updates) {
      let cedulaRNC;
      
      if (update.type === 'rnc9') {
        cedulaRNC = generateRNC(update.base);
      } else if (update.type === 'rnc11') {
        cedulaRNC = generateRNC(update.base);
      } else {
        cedulaRNC = generateCedula(update.base);
      }

      // Verificar que el valor generado sea válido
      if (!validateCedulaRNC(cedulaRNC)) {
        throw new Error(`El RNC/Cédula generado para ${update.nombre} no es válido: ${cedulaRNC}`);
      }

      // Usar replacements para evitar SQL injection
      await queryInterface.sequelize.query(`
        UPDATE Proveedor 
        SET cedulaRNC = :cedulaRNC, updatedAt = GETDATE()
        WHERE nombreComercial = :nombre
      `, {
        replacements: { cedulaRNC, nombre: update.nombre },
        type: Sequelize.QueryTypes.UPDATE
      });

      console.log(`Actualizado: ${update.nombre} -> ${cedulaRNC}`);
    }

    console.log('Todos los proveedores han sido actualizados con RNCs y Cédulas válidos');
  },

  async down(queryInterface, Sequelize) {
    // Revertir a los valores originales del seeder
    const originalValues = [
      { nombre: 'Suministros Generales S.A.', cedulaRNC: '001-1234567-8' },
      { nombre: 'Tecnología Avanzada SRL', cedulaRNC: '131-123456-7' },
      { nombre: 'Materiales de Oficina Express', cedulaRNC: '001-2345678-9' },
      { nombre: 'Equipos y Herramientas SRL', cedulaRNC: '131-234567-8' },
      { nombre: 'Insumos Industriales S.A.', cedulaRNC: '001-3456789-0' },
      { nombre: 'Electrónica y Componentes S.A.', cedulaRNC: '001-4567890-1' },
      { nombre: 'Muebles y Decoración SRL', cedulaRNC: '131-345678-9' },
      { nombre: 'Limpieza Profesional S.A.', cedulaRNC: '001-5678901-2' },
      { nombre: 'Seguridad y Vigilancia SRL', cedulaRNC: '131-456789-0' },
      { nombre: 'Papelería y Librería Premium', cedulaRNC: '001-6789012-3' },
      { nombre: 'Catering Empresarial SRL', cedulaRNC: '131-567890-1' },
      { nombre: 'Transporte y Logística S.A.', cedulaRNC: '001-7890123-4' },
      { nombre: 'Proveedor Temporal SRL', cedulaRNC: '131-678901-2' },
    ];

    for (const original of originalValues) {
      await queryInterface.sequelize.query(`
        UPDATE Proveedor 
        SET cedulaRNC = :cedulaRNC, updatedAt = GETDATE()
        WHERE nombreComercial = :nombre
      `, {
        replacements: { cedulaRNC: original.cedulaRNC, nombre: original.nombre },
        type: Sequelize.QueryTypes.UPDATE
      });
    }

    console.log('Proveedores revertidos a valores originales');
  },
};

