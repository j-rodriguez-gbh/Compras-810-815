require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ComprasDB',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        // No usar instanceName cuando el puerto está configurado directamente
        // instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 60000,
        requestTimeout: 60000,
        useUTC: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    logging: false,
  },
  test: {
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ComprasDB_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    },
  },
  production: {
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ComprasDB',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        // Azure SQL no usa instanceName, se omite
        // instanceName solo para SQL Server Express local
        encrypt: true, // Azure SQL requiere encriptación
        trustServerCertificate: false, // Usar certificados válidos en producción
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
  },
};

