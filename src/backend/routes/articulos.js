const express = require('express');
const router = express.Router();
const ArticuloController = require('../controllers/ArticuloController');
const { validateArticuloCreate, validateArticuloUpdate } = require('../middleware/validation');

router.get('/', ArticuloController.getAll.bind(ArticuloController));
router.get('/:id', ArticuloController.getById.bind(ArticuloController));
router.post('/', validateArticuloCreate, ArticuloController.create.bind(ArticuloController));
router.put('/:id', validateArticuloUpdate, ArticuloController.update.bind(ArticuloController));
router.delete('/:id', ArticuloController.delete.bind(ArticuloController));

module.exports = router;

