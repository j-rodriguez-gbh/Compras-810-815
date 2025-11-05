const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');

// Routes
const departamentosRouter = require('./routes/departamentos');
const unidadesMedidaRouter = require('./routes/unidadesMedida');
const proveedoresRouter = require('./routes/proveedores');
const articulosRouter = require('./routes/articulos');
const ordenesCompraRouter = require('./routes/ordenesCompra');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/departamentos', departamentosRouter);
app.use('/api/unidades-medida', unidadesMedidaRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/articulos', articulosRouter);
app.use('/api/ordenes-compra', ordenesCompraRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Error handler
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${config.nodeEnv}`);
});

module.exports = app;

