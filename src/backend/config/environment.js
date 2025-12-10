require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  contabilidadApiUrl: process.env.CONTABILIDAD_API_URL || 'https://isofinal815-810-backend.onrender.com',
  contabilidadUsername: process.env.CONTABILIDAD_USERNAME || 'compras_user',
  contabilidadPassword: process.env.CONTABILIDAD_PASSWORD || 'ISO815810',
};

