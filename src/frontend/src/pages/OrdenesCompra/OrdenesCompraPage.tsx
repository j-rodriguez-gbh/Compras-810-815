import { useState, useEffect } from 'react'
import { useOrdenesCompra, useCreateOrdenCompra, useUpdateOrdenCompra, useDeleteOrdenCompra, useCambiarEstado } from '../../hooks/useOrdenesCompra'
import { useDepartamentos } from '../../hooks/useDepartamentos'
import { useProveedores } from '../../hooks/useProveedores'
import { useArticulos } from '../../hooks/useArticulos'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import OrdenDetallesModal from '../../components/common/OrdenDetallesModal'
import { useForm, useFieldArray } from 'react-hook-form'
import { OrdenCompra } from '../../types'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { getNextStates, getEstadoLabel } from '../../stateMachines/ordenCompraStateMachine'

export default function OrdenesCompraPage() {
  const { data: ordenesCompra, isLoading } = useOrdenesCompra()
  const { data: departamentos } = useDepartamentos()
  const { data: proveedores } = useProveedores()
  const { data: articulos } = useArticulos()
  const createMutation = useCreateOrdenCompra()
  const updateMutation = useUpdateOrdenCompra()
  const deleteMutation = useDeleteOrdenCompra()
  const cambiarEstadoMutation = useCambiarEstado()
  
  // Filtrar solo entidades activas
  const departamentosActivos = departamentos?.filter(d => d.estado === 'Activo')
  const proveedoresActivos = proveedores?.filter(p => p.estado === 'Activo')
  const articulosActivos = articulos?.filter(a => a.estado === 'Activo')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrden, setEditingOrden] = useState<OrdenCompra | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [ordenToDelete, setOrdenToDelete] = useState<OrdenCompra | null>(null)
  const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false)
  const [ordenDetalles, setOrdenDetalles] = useState<OrdenCompra | null>(null)
  
  const { register, handleSubmit, reset, control, formState: { errors }, watch, setValue } = useForm<Omit<OrdenCompra, 'id' | 'numeroOrden'>>({
    defaultValues: {
      detalles: [{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }],
    },
  })
  
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'detalles',
  })
  
  // Observar cambios en los detalles para actualizar la unidad de medida automáticamente
  // const detalles = watch('detalles') // No se usa actualmente
  
  // Función para actualizar la unidad de medida cuando se selecciona un artículo
  const handleArticuloChange = (index: number, articuloId: number) => {
    const articulo = articulosActivos?.find(a => a.id === articuloId)
    if (articulo && articulo.unidadMedidaId) {
      setValue(`detalles.${index}.unidadMedidaId`, articulo.unidadMedidaId)
    }
  }

  const onSubmit = async (data: Omit<OrdenCompra, 'id' | 'numeroOrden'>) => {
    try {
      if (editingOrden) {
        await updateMutation.mutateAsync({ id: editingOrden.id, ...data })
        toast.success('Orden de compra actualizada exitosamente')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Orden de compra creada exitosamente')
      }
      setIsModalOpen(false)
      const defaultValues: Omit<OrdenCompra, 'id' | 'numeroOrden'> = {
        fechaOrden: new Date().toISOString().split('T')[0],
        estado: 'Pendiente' as const,
        departamentoId: 0,
        proveedorId: 0,
        detalles: [{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }],
      }
      reset(defaultValues)
      replace([{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }])
      setEditingOrden(null)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al procesar la solicitud')
    }
  }

  const handleEdit = (orden: OrdenCompra) => {
    setEditingOrden(orden)
    reset({
      fechaOrden: orden.fechaOrden,
      estado: orden.estado,
      departamentoId: orden.departamentoId,
      proveedorId: orden.proveedorId,
      detalles: orden.detalles || [],
    })
    setIsModalOpen(true)
  }

  const handleDeleteClick = (orden: OrdenCompra) => {
    setOrdenToDelete(orden)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (ordenToDelete) {
      try {
        await deleteMutation.mutateAsync(ordenToDelete.id)
        toast.success('Orden de compra eliminada exitosamente')
        setOrdenToDelete(null)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(axiosError.message || 'Error al eliminar la orden de compra')
      }
    }
  }

  const handleNew = () => {
    setEditingOrden(null)
    const defaultValues: Omit<OrdenCompra, 'id' | 'numeroOrden'> = {
      fechaOrden: new Date().toISOString().split('T')[0],
      estado: 'Pendiente' as const,
      departamentoId: 0,
      proveedorId: 0,
      detalles: [{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }],
    }
    reset(defaultValues)
    replace([{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }])
    setIsModalOpen(true)
  }

  const handleCambiarEstado = async (orden: OrdenCompra, nuevoEstado: string) => {
    try {
      await cambiarEstadoMutation.mutateAsync({ id: orden.id, estado: nuevoEstado })
      toast.success(`Orden de compra ${getEstadoLabel(nuevoEstado).toLowerCase()} exitosamente`)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al cambiar el estado')
    }
  }

  const handleVerDetalles = (orden: OrdenCompra) => {
    setOrdenDetalles(orden)
    setIsDetallesModalOpen(true)
  }

  useEffect(() => {
    if (isModalOpen && !editingOrden) {
      const defaultValues: Omit<OrdenCompra, 'id' | 'numeroOrden'> = {
        fechaOrden: new Date().toISOString().split('T')[0],
        estado: 'Pendiente' as const,
        departamentoId: 0,
        proveedorId: 0,
        detalles: [{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }],
      }
      reset(defaultValues)
      replace([{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }])
    }
  }, [isModalOpen, editingOrden, reset, replace])

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h2>
        <button
          onClick={handleNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nueva Orden
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {ordenesCompra?.map((orden) => (
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
                  <div className="flex flex-col items-end gap-2 min-w-[200px]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerDetalles(orden)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Ver detalles de la orden"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleEdit(orden)}
                        disabled={orden.estado === 'Enviada' || orden.estado === 'Rechazada'}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
                        title={orden.estado === 'Enviada' || orden.estado === 'Rechazada' ? 'No se puede editar una orden ' + orden.estado.toLowerCase() : 'Editar orden'}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(orden)}
                        disabled={orden.estado === 'Enviada'}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
                        title={orden.estado === 'Enviada' ? 'No se puede eliminar una orden enviada' : 'Eliminar orden'}
                      >
                        Eliminar
                      </button>
                    </div>
                    {getNextStates(orden.estado).length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-end">
                        {getNextStates(orden.estado).map((estado) => (
                          <button
                            key={estado}
                            onClick={() => handleCambiarEstado(orden, estado)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              estado === 'Aprobada'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                : estado === 'Rechazada'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                            }`}
                          >
                            {getEstadoLabel(estado)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          const defaultValues: Omit<OrdenCompra, 'id' | 'numeroOrden'> = {
            fechaOrden: new Date().toISOString().split('T')[0],
            estado: 'Pendiente' as const,
            departamentoId: 0,
            proveedorId: 0,
            detalles: [{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }],
          }
          reset(defaultValues)
          replace([{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }])
          setEditingOrden(null)
        }}
        title={editingOrden ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                {...register('fechaOrden', { required: 'La fecha es requerida' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.fechaOrden && <p className="mt-1 text-sm text-red-600">{errors.fechaOrden.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                {...register('estado', { required: 'El estado es requerido' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
                <option value="Enviada">Enviada</option>
              </select>
              {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>}
              {editingOrden && (
                <p className="mt-1 text-sm text-amber-600">
                  ⚠️ Puede seleccionar cualquier estado para corregir errores
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Departamento</label>
              <select
                {...register('departamentoId', { required: 'El departamento es requerido', valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione...</option>
                {departamentosActivos?.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                ))}
              </select>
              {errors.departamentoId && <p className="mt-1 text-sm text-red-600">{errors.departamentoId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Proveedor</label>
              <select
                {...register('proveedorId', { required: 'El proveedor es requerido', valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione...</option>
                {proveedoresActivos?.map((prov) => (
                  <option key={prov.id} value={prov.id}>{prov.nombreComercial}</option>
                ))}
              </select>
              {errors.proveedorId && <p className="mt-1 text-sm text-red-600">{errors.proveedorId.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Detalles</label>
              <button
                type="button"
                onClick={() => append({ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 })}
                className="text-sm text-blue-600 hover:text-blue-900 font-medium"
              >
                + Agregar Detalle
              </button>
            </div>
            {fields.map((field, index) => {
              const articuloId = watch(`detalles.${index}.articuloId`)
              const articuloSeleccionado = articulosActivos?.find(a => a.id === articuloId)
              const unidadMedidaTexto = articuloSeleccionado?.unidadMedida?.descripcion || 
                                       (editingOrden?.detalles?.[index]?.unidadMedida?.descripcion) || 
                                       'Seleccione un artículo'
              
              return (
                <div key={field.id} className="border p-3 mb-2 rounded">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Artículo</label>
                      <select
                        {...register(`detalles.${index}.articuloId`, { 
                          required: true, 
                          valueAsNumber: true,
                          onChange: (e) => {
                            const id = parseInt(e.target.value)
                            handleArticuloChange(index, id)
                          }
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      >
                        <option value="0">Seleccione...</option>
                        {articulosActivos?.map((art) => (
                          <option key={art.id} value={art.id}>{art.descripcion}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Cantidad</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`detalles.${index}.cantidad`, { required: true, valueAsNumber: true, min: 0.01 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Unidad</label>
                      <input
                        type="text"
                        value={unidadMedidaTexto}
                        readOnly
                        disabled={!articuloSeleccionado && !editingOrden?.detalles?.[index]?.unidadMedida}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <input
                        type="hidden"
                        {...register(`detalles.${index}.unidadMedidaId`, { required: true, valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Costo Unit.</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`detalles.${index}.costoUnitario`, { required: true, valueAsNumber: true, min: 0.01 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-2 text-xs text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                const defaultValues: Omit<OrdenCompra, 'id' | 'numeroOrden'> = {
                  fechaOrden: new Date().toISOString().split('T')[0],
                  estado: 'Pendiente' as const,
                  departamentoId: 0,
                  proveedorId: 0,
                  detalles: [{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }],
                }
                reset(defaultValues)
                replace([{ articuloId: 0, cantidad: 0, unidadMedidaId: 0, costoUnitario: 0 }])
                setEditingOrden(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {editingOrden ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setOrdenToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Orden de Compra"
        message={`¿Está seguro de eliminar la orden de compra "${ordenToDelete?.numeroOrden}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

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

