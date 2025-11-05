/**
 * Máquina de estados para Orden de Compra
 * 
 * Estados:
 * - Pendiente: Estado inicial de la orden
 * - Aprobada: Orden aprobada para procesamiento
 * - Rechazada: Orden rechazada
 * - Enviada: Orden enviada al proveedor
 * 
 * Transiciones válidas:
 * - Pendiente → Aprobada
 * - Pendiente → Rechazada
 * - Aprobada → Enviada
 */

/**
 * Valida si una transición de estado es válida
 * @param {string} estadoActual - Estado actual de la orden
 * @param {string} nuevoEstado - Nuevo estado deseado
 * @returns {boolean} - true si la transición es válida
 */
const isValidTransition = (estadoActual, nuevoEstado) => {
  // Validar que ambos estados sean válidos
  const estadosValidos = ['Pendiente', 'Aprobada', 'Rechazada', 'Enviada'];
  if (!estadosValidos.includes(estadoActual) || !estadosValidos.includes(nuevoEstado)) {
    return false;
  }
  
  // Si el estado no cambia, no es una transición válida
  if (estadoActual === nuevoEstado) {
    return false;
  }
  
  // Validar transiciones según máquina de estados
  switch (estadoActual) {
    case 'Pendiente':
      return nuevoEstado === 'Aprobada' || nuevoEstado === 'Rechazada';
    case 'Aprobada':
      return nuevoEstado === 'Enviada';
    case 'Rechazada':
    case 'Enviada':
      // Estados finales, no pueden cambiar
      return false;
    default:
      return false;
  }
};

/**
 * Obtiene los estados posibles a los que puede transicionar desde un estado actual
 * @param {string} estadoActual - Estado actual de la orden
 * @returns {string[]} - Array de estados posibles
 */
const getNextStates = (estadoActual) => {
  switch (estadoActual) {
    case 'Pendiente':
      return ['Aprobada', 'Rechazada'];
    case 'Aprobada':
      return ['Enviada'];
    case 'Rechazada':
    case 'Enviada':
      return [];
    default:
      return [];
  }
};

/**
 * Obtiene el evento necesario para transicionar a un nuevo estado
 * @param {string} estadoActual - Estado actual
 * @param {string} nuevoEstado - Estado deseado
 * @returns {string|null} - Nombre del evento o null si no es válido
 */
const getEventForTransition = (estadoActual, nuevoEstado) => {
  const validTransitions = {
    'Pendiente->Aprobada': 'APROBAR',
    'Pendiente->Rechazada': 'RECHAZAR',
    'Aprobada->Enviada': 'ENVIAR',
  };
  
  const key = `${estadoActual}->${nuevoEstado}`;
  return validTransitions[key] || null;
};

module.exports = {
  isValidTransition,
  getNextStates,
  getEventForTransition,
};

