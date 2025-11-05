/**
 * Valida una cédula dominicana
 * Formato: 11 dígitos numéricos sin guiones ni puntos
 * @param {string} cedula - La cédula a validar
 * @returns {boolean} - true si es válida, false en caso contrario
 */
const validateCedula = (cedula) => {
  if (!cedula || typeof cedula !== 'string') {
    return false;
  }

  // Eliminar espacios y convertir a string
  const cleaned = cedula.trim().replace(/[-\s]/g, '');

  // Debe tener exactamente 11 dígitos
  if (!/^\d{11}$/.test(cleaned)) {
    return false;
  }

  // Validar algoritmo de verificación de cédula dominicana
  const digits = cleaned.split('').map(Number);
  
  // El último dígito es el verificador
  const verifier = digits[10];
  const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let product = digits[i] * multipliers[i];
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit === verifier;
};

/**
 * Valida un RNC (Registro Nacional del Contribuyente) dominicano
 * Formato: 9 o 11 dígitos numéricos sin guiones ni puntos
 * @param {string} rnc - El RNC a validar
 * @returns {boolean} - true si es válido, false en caso contrario
 */
const validateRNC = (rnc) => {
  if (!rnc || typeof rnc !== 'string') {
    return false;
  }

  // Eliminar espacios y convertir a string
  const cleaned = rnc.trim().replace(/[-\s]/g, '');

  // Debe tener 9 u 11 dígitos
  if (!/^\d{9}$|^\d{11}$/.test(cleaned)) {
    return false;
  }

  // Validación para RNC de 9 dígitos
  if (cleaned.length === 9) {
    const digits = cleaned.split('').map(Number);
    const multipliers = [7, 9, 8, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return checkDigit === digits[8];
  }

  // Validación para RNC de 11 dígitos
  if (cleaned.length === 11) {
    const digits = cleaned.split('').map(Number);
    const multipliers = [7, 9, 8, 6, 5, 4, 3, 2, 7, 9];
    
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return checkDigit === digits[10];
  }

  return false;
};

/**
 * Valida si un valor es una cédula o RNC dominicano válido
 * @param {string} cedulaRNC - La cédula o RNC a validar
 * @returns {boolean} - true si es válido (cédula o RNC), false en caso contrario
 */
const validateCedulaRNC = (cedulaRNC) => {
  if (!cedulaRNC || typeof cedulaRNC !== 'string') {
    return false;
  }

  const cleaned = cedulaRNC.trim().replace(/[-\s]/g, '');

  // Si tiene 11 dígitos, puede ser cédula o RNC
  if (cleaned.length === 11) {
    // Intentar primero como cédula
    if (validateCedula(cleaned)) {
      return true;
    }
    // Si no es cédula válida, intentar como RNC
    return validateRNC(cleaned);
  }

  // Si tiene 9 dígitos, solo puede ser RNC
  if (cleaned.length === 9) {
    return validateRNC(cleaned);
  }

  return false;
};

/**
 * Genera una cédula dominicana válida con dígito verificador correcto
 * @param {string} base - Los primeros 10 dígitos (sin el verificador)
 * @returns {string} - La cédula completa con dígito verificador válido
 */
const generateCedula = (base) => {
  if (!base || typeof base !== 'string' || !/^\d{10}$/.test(base)) {
    throw new Error('La base debe ser una cadena de 10 dígitos');
  }

  const digits = base.split('').map(Number);
  const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let product = digits[i] * multipliers[i];
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return base + checkDigit.toString();
};

/**
 * Genera un RNC dominicano válido con dígito verificador correcto
 * @param {string} base - Los primeros dígitos (8 para RNC de 9, 10 para RNC de 11)
 * @returns {string} - El RNC completo con dígito verificador válido
 */
const generateRNC = (base) => {
  if (!base || typeof base !== 'string') {
    throw new Error('La base debe ser una cadena');
  }

  // RNC de 9 dígitos
  if (/^\d{8}$/.test(base)) {
    const digits = base.split('').map(Number);
    const multipliers = [7, 9, 8, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return base + checkDigit.toString();
  }

  // RNC de 11 dígitos
  if (/^\d{10}$/.test(base)) {
    const digits = base.split('').map(Number);
    const multipliers = [7, 9, 8, 6, 5, 4, 3, 2, 7, 9];
    
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return base + checkDigit.toString();
  }

  throw new Error('La base debe tener 8 dígitos (para RNC de 9) o 10 dígitos (para RNC de 11)');
};

module.exports = {
  validateCedula,
  validateRNC,
  validateCedulaRNC,
  generateCedula,
  generateRNC,
};

