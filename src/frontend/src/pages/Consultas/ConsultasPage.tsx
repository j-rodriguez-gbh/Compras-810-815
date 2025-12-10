import { useState } from 'react'
import { useConsultarPorCriterios } from '../../hooks/useOrdenesCompra'
import { useDepartamentos } from '../../hooks/useDepartamentos'
import { useProveedores } from '../../hooks/useProveedores'
import OrdenDetallesModal from '../../components/common/OrdenDetallesModal'
import { OrdenCompra } from '../../types'

export default function ConsultasPage() {
  const { data: departamentos } = useDepartamentos()
  const { data: proveedores } = useProveedores()
  
  // Filtrar solo entidades activas
  const departamentosActivos = departamentos?.filter(d => d.estado === 'Activo')
  const proveedoresActivos = proveedores?.filter(p => p.estado === 'Activo')
  
  const [criterios, setCriterios] = useState({
    departamentoId: '',
    proveedorId: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false)
  const [ordenDetalles, setOrdenDetalles] = useState<OrdenCompra | null>(null)

  const { data: ordenesCompra, isLoading, refetch } = useConsultarPorCriterios(criterios)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCriterios({
      ...criterios,
      [e.target.name]: e.target.value,
    })
  }

  const handleSearch = () => {
    const criteriosFiltrados = Object.fromEntries(
      Object.entries(criterios).filter(([_, value]) => value !== '')
    ) as typeof criterios
    setCriterios(criteriosFiltrados)
    refetch()
  }

  const handleClear = () => {
    setCriterios({
      departamentoId: '',
      proveedorId: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
    })
  }

  const handleVerDetalles = (orden: OrdenCompra) => {
    setOrdenDetalles(orden)
    setIsDetallesModalOpen(true)
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Consultas por Criterios</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <select
              name="departamentoId"
              value={criterios.departamentoId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {departamentosActivos?.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select
              name="proveedorId"
              value={criterios.proveedorId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {proveedoresActivos?.map((prov) => (
                <option key={prov.id} value={prov.id}>{prov.nombreComercial}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              value={criterios.estado}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Enviada">Enviada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              name="fechaDesde"
              value={criterios.fechaDesde}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              name="fechaHasta"
              value={criterios.fechaHasta}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {ordenesCompra && ordenesCompra.length > 0 ? (
              ordenesCompra.map((orden) => (
                <li key={orden.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Orden: {orden.numeroOrden}</p>
                        <p className="text-sm text-gray-500">Fecha: {orden.fechaOrden}</p>
                        <p className="text-sm text-gray-500">Departamento: {orden.departamento?.nombre}</p>
                        <p className="text-sm text-gray-500">Proveedor: {orden.proveedor?.nombreComercial}</p>
                        <p className="text-sm text-gray-500">
                          Estado: <span className={`font-medium ${
                            orden.estado === 'Aprobada' ? 'text-green-600' :
                            orden.estado === 'Rechazada' ? 'text-red-600' :
                            orden.estado === 'Enviada' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>{orden.estado}</span>
                        </p>
                        <p className="text-sm text-gray-500">Detalles: {orden.detalles?.length || 0} items</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleVerDetalles(orden)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                          title="Ver detalles de la orden"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-gray-500">
                No se encontraron órdenes con los criterios especificados
              </li>
            )}
          </ul>
        </div>
      )}

      <OrdenDetallesModal
        isOpen={isDetallesModalOpen}
        onClose={() => {
          setIsDetallesModalOpen(false)
          setOrdenDetalles(null)
        }}
        orden={ordenDetalles}
      />
    </div>
  )
}

