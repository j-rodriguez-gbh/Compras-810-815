const { Sequelize } = require('sequelize');
require('dotenv').config();

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
        // No usar instanceName cuando el puerto está configurado directamente
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 60000,
        requestTimeout: 60000,
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

