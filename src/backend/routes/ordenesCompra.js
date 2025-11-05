const express = require('express');
const router = express.Router();
const OrdenCompraController = require('../controllers/OrdenCompraController');
const { validateOrdenCompra } = require('../middleware/validation');

router.get('/', OrdenCompraController.getAll.bind(OrdenCompraController));
router.get('/consulta', OrdenCompraController.consultarPorCriterios.bind(OrdenCompraController));
router.get('/:id', OrdenCompraController.getById.bind(OrdenCompraController));
router.get('/:id/estados-posibles', OrdenCompraController.getEstadosPosibles.bind(OrdenCompraController));
router.post('/', validateOrdenCompra, OrdenCompraController.create.bind(OrdenCompraController));
router.put('/:id', validateOrdenCompra, OrdenCompraController.update.bind(OrdenCompraController));
router.patch('/:id/estado', OrdenCompraController.cambiarEstado.bind(OrdenCompraController));
router.delete('/:id', OrdenCompraController.delete.bind(OrdenCompraController));

module.exports = router;

