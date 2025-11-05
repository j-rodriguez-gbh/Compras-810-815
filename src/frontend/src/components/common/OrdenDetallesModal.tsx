import { OrdenCompra } from '../../types'

interface OrdenDetallesModalProps {
  isOpen: boolean
  onClose: () => void
  orden: OrdenCompra | null
}

export default function OrdenDetallesModal({ isOpen, onClose, orden }: OrdenDetallesModalProps) {
  if (!isOpen || !orden) return null

  const calcularSubtotal = (detalle: { cantidad: number; costoUnitario: number }) => {
    return detalle.cantidad * detalle.costoUnitario
  }

  const calcularTotal = () => {
    if (!orden.detalles || orden.detalles.length === 0) return 0
    return orden.detalles.reduce((total, detalle) => {
      return total + calcularSubtotal(detalle)
    }, 0)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de Orden {orden.numeroOrden}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Número de Orden</p>
            <p className="text-sm text-gray-900">{orden.numeroOrden}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Fecha</p>
            <p className="text-sm text-gray-900">{orden.fechaOrden}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Departamento</p>
            <p className="text-sm text-gray-900">{orden.departamento?.nombre || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Proveedor</p>
            <p className="text-sm text-gray-900">{orden.proveedor?.nombreComercial || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className={`text-sm font-medium ${
              orden.estado === 'Aprobada' ? 'text-green-600' :
              orden.estado === 'Rechazada' ? 'text-red-600' :
              orden.estado === 'Enviada' ? 'text-blue-600' :
              'text-yellow-600'
            }`}>{orden.estado}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Artículos</h3>
          <div className="overflow-x-visible">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Unitario
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orden.detalles && orden.detalles.length > 0 ? (
                  orden.detalles.map((detalle, index) => (
                    <tr key={detalle.id || index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {detalle.articulo?.descripcion || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {detalle.cantidad.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {detalle.unidadMedida?.descripcion || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${detalle.costoUnitario.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ${calcularSubtotal(detalle).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                      No hay detalles disponibles
                    </td>
                  </tr>
                )}
              </tbody>
              {orden.detalles && orden.detalles.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      ${calcularTotal().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

