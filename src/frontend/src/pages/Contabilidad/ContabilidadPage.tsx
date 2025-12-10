import { useState } from 'react'
import { useTransaccionesPendientes, useContabilizarAsiento, useAsientosExternos, useSincronizarAsientos } from '../../hooks/useAsientosContables'
import toast from 'react-hot-toast'

export default function ContabilidadPage() {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'externos' | 'sincronizar'>('pendientes')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { transacciones, isLoading, refetch } = useTransaccionesPendientes(
    fechaDesde || undefined,
    fechaHasta || undefined
  )
  const { asientos: asientosExternos, isLoading: isLoadingExternos, refetch: refetchExternos } = useAsientosExternos(
    activeTab === 'externos' ? { fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined } : undefined
  )
  const contabilizarMutation = useContabilizarAsiento()
  const sincronizarMutation = useSincronizarAsientos()

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

  const handleSincronizar = async () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Seleccione un rango de fechas para sincronizar')
      return
    }

    try {
      await sincronizarMutation.mutateAsync({ fechaDesde, fechaHasta })
      refetch()
      refetchExternos()
    } catch (error) {
      console.error('Error al sincronizar:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`${
                activeTab === 'pendientes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              data-testid="tab-pendientes"
            >
              Asientos Pendientes
            </button>
            <button
              onClick={() => setActiveTab('externos')}
              className={`${
                activeTab === 'externos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              data-testid="tab-externos"
            >
              Asientos Externos
            </button>
            <button
              onClick={() => setActiveTab('sincronizar')}
              className={`${
                activeTab === 'sincronizar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              data-testid="tab-sincronizar"
            >
              Sincronización
            </button>
          </nav>
        </div>

        <div className="p-6">
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

        {activeTab === 'pendientes' && (
            <>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando transacciones...</p>
                </div>
              ) : transacciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay transacciones pendientes o con error para el rango de fechas seleccionado
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaccion.estado === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaccion.estado === 'Error'
                              ? 'bg-red-100 text-red-800'
                              : transaccion.estado === 'Confirmado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaccion.estado}
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
            </>
          )}

          {activeTab === 'externos' && (
            <>
              {isLoadingExternos ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando asientos externos...</p>
                </div>
              ) : asientosExternos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay asientos externos para el rango de fechas seleccionado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cuenta
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo Movimiento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {asientosExternos.map((asiento) => (
                        <tr key={asiento.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {asiento.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {asiento.description || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {asiento.account?.id || 'N/A'}
                            {asiento.account?.description && (
                              <span className="ml-2 text-xs text-gray-400">
                                ({asiento.account.description})
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(asiento.entryDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(parseFloat(asiento.amount.toString()))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                asiento.movementType === 'DB'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {asiento.movementType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'sincronizar' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  La sincronización compara los asientos locales con los del sistema externo para identificar discrepancias.
                  Seleccione un rango de fechas y haga clic en "Sincronizar" para comenzar.
                </p>
              </div>

              {sincronizarMutation.isPending ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Sincronizando...</p>
                </div>
              ) : sincronizarMutation.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Asientos Locales</p>
                      <p className="text-2xl font-bold text-gray-900">{sincronizarMutation.data.asientosLocales}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Asientos Externos</p>
                      <p className="text-2xl font-bold text-gray-900">{sincronizarMutation.data.asientosExternos}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Sincronizados</p>
                      <p className="text-2xl font-bold text-green-600">{sincronizarMutation.data.sincronizados}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Discrepancias</p>
                      <p className="text-2xl font-bold text-red-600">{sincronizarMutation.data.discrepancias}</p>
                    </div>
                  </div>

                  {sincronizarMutation.data.detalles.discrepancias.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                        <h3 className="text-lg font-medium text-red-900">Discrepancias Encontradas</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                ID Local
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Descripción
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tipo
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sincronizarMutation.data.detalles.discrepancias.map((disc, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {disc.local.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {disc.local.descripcion || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                  {disc.tipo}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Seleccione un rango de fechas y haga clic en "Sincronizar" para comparar los asientos
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSincronizar}
                  disabled={!fechaDesde || !fechaHasta || sincronizarMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="sincronizar-button"
                >
                  {sincronizarMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

