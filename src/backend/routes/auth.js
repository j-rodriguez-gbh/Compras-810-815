const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('El username es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El username debe tener entre 3 y 100 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate,
];

const registerValidation = [
  body('username')
    .notEmpty()
    .withMessage('El username es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El username debe tener entre 3 y 100 caracteres'),
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email debe ser válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  validate,
];

router.post('/login', loginValidation, AuthController.login);
router.post('/register', registerValidation, AuthController.register);
router.get('/me', authenticate, AuthController.getCurrentUser);

module.exports = router;

