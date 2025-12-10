const { Sequelize } = require('sequelize');
require('dotenv').config();

// Detectar si es Azure SQL (host contiene .database.windows.net)
const isAzureSQL = process.env.DB_HOST && process.env.DB_HOST.includes('.database.windows.net');
const isProduction = process.env.NODE_ENV === 'production';

// Configuración de encriptación: Azure SQL siempre requiere encriptación
// En producción también usamos encriptación, en desarrollo local puede ser false
const encrypt = isAzureSQL || isProduction;
const trustServerCertificate = !isProduction && !isAzureSQL; // Solo true en desarrollo local

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        // Azure SQL requiere encriptación, producción también
        encrypt: encrypt,
        trustServerCertificate: trustServerCertificate,
        enableArithAbort: true,
        connectTimeout: 60000,
        requestTimeout: 60000,
        // No usar instanceName para Azure SQL
        // instanceName solo para SQL Server Express local
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQL Server establecida correctamente');
  } catch (error) {
    console.error('❌ Error de conexión a SQL Server:', error);
  }
};

if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = sequelize;

