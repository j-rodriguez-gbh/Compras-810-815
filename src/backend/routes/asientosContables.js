const express = require('express');
const router = express.Router();
const AsientoContableController = require('../controllers/AsientoContableController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, AsientoContableController.getAll.bind(AsientoContableController));
router.get('/pendientes', authenticate, AsientoContableController.getTransaccionesPendientes.bind(AsientoContableController));
router.get('/:id', authenticate, AsientoContableController.getById.bind(AsientoContableController));
router.post('/generar/:ordenCompraId', authenticate, AsientoContableController.generarDesdeOrdenCompra.bind(AsientoContableController));
router.post('/:id/contabilizar', authenticate, AsientoContableController.contabilizar.bind(AsientoContableController));
router.post('/orden/:ordenCompraId/contabilizar', authenticate, AsientoContableController.contabilizarPorOrden.bind(AsientoContableController));

module.exports = router;

