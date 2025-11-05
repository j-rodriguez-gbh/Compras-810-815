import { createMachine } from 'xstate'

/**
 * Máquina de estados para Orden de Compra (Frontend)
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
export const ordenCompraStateMachine = createMachine({
  id: 'ordenCompra',
  initial: 'Pendiente',
  states: {
    Pendiente: {
      on: {
        APROBAR: 'Aprobada',
        RECHAZAR: 'Rechazada',
      },
    },
    Aprobada: {
      on: {
        ENVIAR: 'Enviada',
      },
    },
    Rechazada: {
      type: 'final',
    },
    Enviada: {
      type: 'final',
    },
  },
})

/**
 * Valida si una transición de estado es válida
 */
export const isValidTransition = (estadoActual: string, nuevoEstado: string): boolean => {
  switch (estadoActual) {
    case 'Pendiente':
      return nuevoEstado === 'Aprobada' || nuevoEstado === 'Rechazada'
    case 'Aprobada':
      return nuevoEstado === 'Enviada'
    case 'Rechazada':
    case 'Enviada':
      return false // Estados finales
    default:
      return false
  }
}

/**
 * Obtiene los estados posibles a los que puede transicionar desde un estado actual
 */
export const getNextStates = (estadoActual: string): string[] => {
  switch (estadoActual) {
    case 'Pendiente':
      return ['Aprobada', 'Rechazada']
    case 'Aprobada':
      return ['Enviada']
    case 'Rechazada':
    case 'Enviada':
      return []
    default:
      return []
  }
}

/**
 * Obtiene el label del botón para cambiar a un estado
 */
export const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    Aprobada: 'Aprobar',
    Rechazada: 'Rechazar',
    Enviada: 'Enviar',
  }
  return labels[estado] || estado
}

