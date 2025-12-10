import { useState } from 'react'
import { useTransaccionesPendientes, useContabilizarAsiento } from '../../hooks/useAsientosContables'
import { AsientoContable } from '../../types'
import toast from 'react-hot-toast'

export default function ContabilidadPage() {
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { transacciones, isLoading, refetch } = useTransaccionesPendientes(
    fechaDesde || undefined,
    fechaHasta || undefined
  )
  const contabilizarMutation = useContabilizarAsiento()

  const handleFechaChange = () => {
    refetch()
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(transacciones.map((t) => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleContabilizar = async () => {
    if (selectedIds.length === 0) {
      toast.error('Seleccione al menos una transacción para contabilizar')
      return
    }

    try {
      const promises = selectedIds.map((id) => contabilizarMutation.mutateAsync(id))
      await Promise.all(promises)
      setSelectedIds([])
      refetch()
      toast.success(`${selectedIds.length} transacción(es) contabilizada(s) exitosamente`)
    } catch (error) {
      console.error('Error al contabilizar:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('es-ES', { month: 'long' })
    return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde:
            </label>
            <input
              type="date"
              id="fechaDesde"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value)
                handleFechaChange()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              data-testid="fecha-desde-input"
            />
          </div>
          <div>
            <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta:
            </label>
            <input
              type="date"
              id="fechaHasta"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value)
                handleFechaChange()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              data-testid="fecha-hasta-input"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando transacciones...</p>
          </div>
        ) : transacciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay transacciones pendientes para el rango de fechas seleccionado
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === transacciones.length && transacciones.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        data-testid="select-all-checkbox"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Id. Transaccion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripcion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Transacciones
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Id. Asiento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Movimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transacciones.map((transaccion) => (
                    <tr
                      key={transaccion.id}
                      className={selectedIds.includes(transaccion.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(transaccion.id)}
                          onChange={() => handleSelectOne(transaccion.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          data-testid={`select-checkbox-${transaccion.id}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaccion.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaccion.descripcion || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaccion.fechaAsiento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(parseFloat(transaccion.montoAsiento.toString()))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaccion.identificadorAsiento || 'null'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaccion.tipoMovimiento === 'DB'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaccion.tipoMovimiento}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleContabilizar}
                disabled={selectedIds.length === 0 || contabilizarMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="contabilizar-button"
              >
                {contabilizarMutation.isPending
                  ? 'Contabilizando...'
                  : `Contabilizar (${selectedIds.length})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

