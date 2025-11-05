const express = require('express');
const router = express.Router();
const UnidadMedidaController = require('../controllers/UnidadMedidaController');
const { validateUnidadMedidaCreate, validateUnidadMedidaUpdate } = require('../middleware/validation');

router.get('/', UnidadMedidaController.getAll.bind(UnidadMedidaController));
router.get('/:id', UnidadMedidaController.getById.bind(UnidadMedidaController));
router.post('/', validateUnidadMedidaCreate, UnidadMedidaController.create.bind(UnidadMedidaController));
router.put('/:id', validateUnidadMedidaUpdate, UnidadMedidaController.update.bind(UnidadMedidaController));
router.delete('/:id', UnidadMedidaController.delete.bind(UnidadMedidaController));

module.exports = router;

