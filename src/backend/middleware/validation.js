const { body, validationResult } = require('express-validator');
const { validateCedulaRNC } = require('../utils/validators');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array(),
    });
  }
  next();
};

const validateDepartamentoCreate = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  handleValidationErrors,
];

const validateDepartamentoUpdate = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
    return true;
  }),
  handleValidationErrors,
];

const validateUnidadMedidaCreate = [
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 1, max: 255 })
    .withMessage('La descripción debe tener entre 1 y 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  handleValidationErrors,
];

const validateUnidadMedidaUpdate = [
  body('descripcion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
    .isLength({ min: 1, max: 255 })
    .withMessage('La descripción debe tener entre 1 y 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
    return true;
  }),
  handleValidationErrors,
];

const validateProveedorCreate = [
  body('cedulaRNC')
    .trim()
    .notEmpty()
    .withMessage('La cédula/RNC es requerida')
    .isLength({ min: 1, max: 50 })
    .withMessage('La cédula/RNC debe tener entre 1 y 50 caracteres')
    .custom((value) => {
      if (!validateCedulaRNC(value)) {
        throw new Error('La cédula/RNC no es válida. Debe ser una cédula de 11 dígitos o un RNC de 9 u 11 dígitos válido');
      }
      return true;
    }),
  body('nombreComercial')
    .trim()
    .notEmpty()
    .withMessage('El nombre comercial es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre comercial debe tener entre 1 y 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  handleValidationErrors,
];

const validateProveedorUpdate = [
  body('cedulaRNC')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La cédula/RNC no puede estar vacía')
    .isLength({ min: 1, max: 50 })
    .withMessage('La cédula/RNC debe tener entre 1 y 50 caracteres')
    .custom((value) => {
      if (!validateCedulaRNC(value)) {
        throw new Error('La cédula/RNC no es válida. Debe ser una cédula de 11 dígitos o un RNC de 9 u 11 dígitos válido');
      }
      return true;
    }),
  body('nombreComercial')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre comercial no puede estar vacío')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre comercial debe tener entre 1 y 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
    return true;
  }),
  handleValidationErrors,
];

const validateArticuloCreate = [
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 1, max: 255 })
    .withMessage('La descripción debe tener entre 1 y 255 caracteres'),
  body('marca')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca debe tener máximo 100 caracteres'),
  body('unidadMedidaId')
    .notEmpty()
    .withMessage('La unidad de medida es requerida')
    .isInt()
    .withMessage('La unidad de medida debe ser un número entero'),
  body('existencia')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La existencia debe ser un número mayor o igual a 0'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  handleValidationErrors,
];

const validateArticuloUpdate = [
  body('descripcion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
    .isLength({ min: 1, max: 255 })
    .withMessage('La descripción debe tener entre 1 y 255 caracteres'),
  body('marca')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca debe tener máximo 100 caracteres'),
  body('unidadMedidaId')
    .optional()
    .isInt()
    .withMessage('La unidad de medida debe ser un número entero'),
  body('existencia')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La existencia debe ser un número mayor o igual a 0'),
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado debe ser Activo o Inactivo'),
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
    return true;
  }),
  handleValidationErrors,
];

const validateOrdenCompra = [
  body('fechaOrden')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  body('estado')
    .optional()
    .isIn(['Pendiente', 'Aprobada', 'Rechazada', 'Enviada'])
    .withMessage('El estado debe ser válido'),
  body('departamentoId')
    .notEmpty()
    .withMessage('El departamento es requerido')
    .isInt()
    .withMessage('El departamento debe ser un número entero'),
  body('proveedorId')
    .notEmpty()
    .withMessage('El proveedor es requerido')
    .isInt()
    .withMessage('El proveedor debe ser un número entero'),
  body('detalles')
    .isArray({ min: 1 })
    .withMessage('Debe tener al menos un detalle'),
  body('detalles.*.articuloId')
    .notEmpty()
    .withMessage('El artículo es requerido en cada detalle')
    .isInt()
    .withMessage('El artículo debe ser un número entero'),
  body('detalles.*.cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser mayor a 0'),
  body('detalles.*.unidadMedidaId')
    .notEmpty()
    .withMessage('La unidad de medida es requerida en cada detalle')
    .isInt()
    .withMessage('La unidad de medida debe ser un número entero'),
  body('detalles.*.costoUnitario')
    .notEmpty()
    .withMessage('El costo unitario es requerido en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('El costo unitario debe ser mayor a 0'),
  handleValidationErrors,
];

module.exports = {
  validateDepartamento: validateDepartamentoCreate,
  validateDepartamentoCreate,
  validateDepartamentoUpdate,
  validateUnidadMedida: validateUnidadMedidaCreate,
  validateUnidadMedidaCreate,
  validateUnidadMedidaUpdate,
  validateProveedor: validateProveedorCreate,
  validateProveedorCreate,
  validateProveedorUpdate,
  validateArticulo: validateArticuloCreate,
  validateArticuloCreate,
  validateArticuloUpdate,
  validateOrdenCompra,
};

