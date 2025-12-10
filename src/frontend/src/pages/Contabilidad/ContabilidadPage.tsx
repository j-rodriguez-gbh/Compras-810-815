import { useState } from 'react'
import { useTransaccionesPendientes, useContabilizarAsiento, useAsientosExternos } from '../../hooks/useAsientosContables'
import toast from 'react-hot-toast'

export default function ContabilidadPage() {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'externos'>('pendientes')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  // Filtros para asientos externos
  const [filtroEntryDate, setFiltroEntryDate] = useState('')
  const [filtroAccountId, setFiltroAccountId] = useState('')
  const [filtroMovementType, setFiltroMovementType] = useState<'DB' | 'CR' | ''>('')

  const { transacciones, isLoading, refetch } = useTransaccionesPendientes(
    fechaDesde || undefined,
    fechaHasta || undefined
  )
  const { asientos: asientosExternos, isLoading: isLoadingExternos } = useAsientosExternos(
    activeTab === 'externos' 
      ? { 
          startDate: fechaDesde && fechaDesde.trim() !== '' ? fechaDesde : undefined,
          endDate: fechaHasta && fechaHasta.trim() !== '' ? fechaHasta : undefined,
          entryDate: filtroEntryDate && filtroEntryDate.trim() !== '' ? filtroEntryDate : undefined,
          accountId: filtroAccountId && filtroAccountId.trim() !== '' ? parseInt(filtroAccountId) : undefined,
          movementType: filtroMovementType || undefined,
        } 
      : undefined
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
      // Agrupar asientos por ordenCompraId para evitar procesar la misma orden múltiples veces
      const asientosSeleccionados = transacciones.filter(t => selectedIds.includes(t.id))
      const ordenesUnicas = new Set<number>()
      const asientosAProcesar: number[] = []

      // Solo procesar un asiento por cada orden de compra
      for (const asiento of asientosSeleccionados) {
        if (asiento.ordenCompraId && !ordenesUnicas.has(asiento.ordenCompraId)) {
          ordenesUnicas.add(asiento.ordenCompraId)
          asientosAProcesar.push(asiento.id)
        } else if (!asiento.ordenCompraId) {
          // Si no tiene ordenCompraId, procesarlo individualmente
          asientosAProcesar.push(asiento.id)
        }
      }

      if (asientosAProcesar.length === 0) {
        toast.error('No hay asientos válidos para contabilizar')
        return
      }

      // Si hay asientos duplicados de la misma orden, informar al usuario
      if (asientosAProcesar.length < selectedIds.length) {
        const duplicados = selectedIds.length - asientosAProcesar.length
        toast(`${duplicados} asiento(s) de órdenes ya seleccionadas fueron omitidos`, {
          icon: 'ℹ️',
          duration: 3000,
        })
      }

      const promises = asientosAProcesar.map((id) => contabilizarMutation.mutateAsync(id))
      await Promise.all(promises)
      setSelectedIds([])
      refetch()
      toast.success(`${asientosAProcesar.length} transacción(es) contabilizada(s) exitosamente`)
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

          {activeTab === 'externos' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-t pt-4">
                <div>
                  <label htmlFor="filtroEntryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Exacta (opcional):
                  </label>
                  <input
                    type="date"
                    id="filtroEntryDate"
                    value={filtroEntryDate}
                    onChange={(e) => setFiltroEntryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="filtro-entry-date-input"
                  />
                  <p className="mt-1 text-xs text-gray-500">Si se especifica, ignora el rango de fechas</p>
                </div>
                <div>
                  <label htmlFor="filtroAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Cuenta:
                  </label>
                  <input
                    type="number"
                    id="filtroAccountId"
                    value={filtroAccountId}
                    onChange={(e) => setFiltroAccountId(e.target.value)}
                    placeholder="Ej: 80, 82"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="filtro-account-id-input"
                  />
                </div>
                <div>
                  <label htmlFor="filtroMovementType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Movimiento:
                  </label>
                  <select
                    id="filtroMovementType"
                    value={filtroMovementType}
                    onChange={(e) => setFiltroMovementType(e.target.value as 'DB' | 'CR' | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="filtro-movement-type-select"
                  >
                    <option value="">Todos</option>
                    <option value="DB">Débito (DB)</option>
                    <option value="CR">Crédito (CR)</option>
                  </select>
                </div>
              </div>
              {(filtroEntryDate || filtroAccountId || filtroMovementType) && (
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFiltroEntryDate('')
                      setFiltroAccountId('')
                      setFiltroMovementType('')
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    data-testid="limpiar-filtros-button"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </>
          )}

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
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === transacciones.length && transacciones.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          data-testid="select-all-checkbox"
                        />
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Descripción
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Monto
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Asiento
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
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
                        <td className="px-2 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(transaccion.id)}
                            onChange={() => handleSelectOne(transaccion.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            data-testid={`select-checkbox-${transaccion.id}`}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaccion.id}
                        </td>
                        <td className="px-2 py-2 max-w-[200px] text-sm text-gray-500">
                          <div className="truncate" title={transaccion.descripcion || 'N/A'}>
                            {transaccion.descripcion || 'N/A'}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaccion.fechaAsiento)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(parseFloat(transaccion.montoAsiento.toString()))}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          <div className="truncate max-w-[100px]" title={transaccion.identificadorAsiento || 'null'}>
                            {transaccion.identificadorAsiento || 'null'}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                              transaccion.tipoMovimiento === 'DB'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaccion.tipoMovimiento}
                          </span>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
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
                        <td className="px-6 py-4 max-w-xs text-sm text-gray-500">
                          <div className="truncate" title={asiento.description || 'N/A'}>
                            {asiento.description || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="whitespace-nowrap">
                            {asiento.account?.id || 'N/A'}
                          </div>
                          {asiento.account?.description && (
                            <div className="truncate max-w-xs text-xs text-gray-400" title={asiento.account.description}>
                              ({asiento.account.description})
                            </div>
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
        </div>
      </div>
    </div>
  )
}

