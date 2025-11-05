const express = require('express');
const router = express.Router();
const DepartamentoController = require('../controllers/DepartamentoController');
const { validateDepartamentoCreate, validateDepartamentoUpdate } = require('../middleware/validation');

router.get('/', DepartamentoController.getAll.bind(DepartamentoController));
router.get('/:id', DepartamentoController.getById.bind(DepartamentoController));
router.post('/', validateDepartamentoCreate, DepartamentoController.create.bind(DepartamentoController));
router.put('/:id', validateDepartamentoUpdate, DepartamentoController.update.bind(DepartamentoController));
router.delete('/:id', DepartamentoController.delete.bind(DepartamentoController));

module.exports = router;

