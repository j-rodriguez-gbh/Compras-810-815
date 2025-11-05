const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/ProveedorController');
const { validateProveedorCreate, validateProveedorUpdate } = require('../middleware/validation');

router.get('/', ProveedorController.getAll.bind(ProveedorController));
router.get('/:id', ProveedorController.getById.bind(ProveedorController));
router.post('/', validateProveedorCreate, ProveedorController.create.bind(ProveedorController));
router.put('/:id', validateProveedorUpdate, ProveedorController.update.bind(ProveedorController));
router.delete('/:id', ProveedorController.delete.bind(ProveedorController));

module.exports = router;

