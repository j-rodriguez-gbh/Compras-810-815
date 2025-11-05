import { useState, useEffect } from 'react'
import { useArticulos, useCreateArticulo, useUpdateArticulo, useDeleteArticulo } from '../../hooks/useArticulos'
import { useUnidadesMedida } from '../../hooks/useUnidadesMedida'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useForm } from 'react-hook-form'
import { Articulo } from '../../types'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

export default function ArticulosPage() {
  const { data: articulos, isLoading } = useArticulos()
  const { data: unidadesMedida } = useUnidadesMedida()
  const createMutation = useCreateArticulo()
  const updateMutation = useUpdateArticulo()
  const deleteMutation = useDeleteArticulo()
  
  // Filtrar solo unidades de medida activas
  const unidadesMedidaActivas = unidadesMedida?.filter(u => u.estado === 'Activo')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticulo, setEditingArticulo] = useState<Articulo | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [articuloToDelete, setArticuloToDelete] = useState<Articulo | null>(null)
  const [showInactivos, setShowInactivos] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Articulo, 'id'>>()

  const onSubmit = async (data: Omit<Articulo, 'id'>) => {
    try {
      if (editingArticulo) {
        await updateMutation.mutateAsync({ id: editingArticulo.id, ...data })
        toast.success('Artículo actualizado exitosamente')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Artículo creado exitosamente')
      }
      setIsModalOpen(false)
      reset({
        descripcion: '',
        marca: '',
        unidadMedidaId: 0,
        existencia: 0,
        estado: 'Activo',
      })
      setEditingArticulo(null)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al procesar la solicitud')
    }
  }

  const handleEdit = (articulo: Articulo) => {
    setEditingArticulo(articulo)
    reset(articulo)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (articulo: Articulo) => {
    setArticuloToDelete(articulo)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (articuloToDelete) {
      try {
        await deleteMutation.mutateAsync(articuloToDelete.id)
        toast.success('Artículo desactivado exitosamente')
        setArticuloToDelete(null)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(axiosError.message || 'Error al desactivar el artículo')
      }
    }
  }

  const handleActivate = async (articulo: Articulo) => {
    try {
      await updateMutation.mutateAsync({ id: articulo.id, estado: 'Activo' })
      toast.success('Artículo activado exitosamente')
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al activar el artículo')
    }
  }

  const filteredArticulos = showInactivos
    ? articulos?.filter(a => a.estado === 'Inactivo')
    : articulos?.filter(a => a.estado === 'Activo')

  const handleNew = () => {
    setEditingArticulo(null)
    reset({
      descripcion: '',
      marca: '',
      unidadMedidaId: 0,
      existencia: 0,
      estado: 'Activo',
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (isModalOpen && !editingArticulo) {
      reset({
        descripcion: '',
        marca: '',
        unidadMedidaId: 0,
        existencia: 0,
        estado: 'Activo',
      })
    }
  }, [isModalOpen, editingArticulo, reset])

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Artículos</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactivos}
              onChange={(e) => setShowInactivos(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar inactivos</span>
          </label>
          <button
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Nuevo Artículo
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredArticulos && filteredArticulos.length > 0 ? (
            filteredArticulos.map((articulo) => (
            <li key={articulo.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{articulo.descripcion}</p>
                    <p className="text-sm text-gray-500">Marca: {articulo.marca || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Existencia: {articulo.existencia}</p>
                    <p className="text-sm text-gray-500">Unidad: {articulo.unidadMedida?.descripcion}</p>
                    <p className="text-sm text-gray-500">Estado: {articulo.estado}</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-[200px] justify-end">
                    {articulo.estado === 'Activo' ? (
                      <>
                        <button
                          onClick={() => handleEdit(articulo)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Editar artículo"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(articulo)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Desactivar artículo"
                        >
                          Desactivar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleActivate(articulo)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                        title="Activar artículo"
                      >
                        Activar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))
          ) : (
            <li className="px-4 py-4 text-center text-gray-500">
              {showInactivos ? 'No hay artículos inactivos' : 'No hay artículos activos'}
            </li>
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          reset({
            descripcion: '',
            marca: '',
            unidadMedidaId: 0,
            existencia: 0,
            estado: 'Activo',
          })
          setEditingArticulo(null)
        }}
        title={editingArticulo ? 'Editar Artículo' : 'Nuevo Artículo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              {...register('descripcion', { required: 'La descripción es requerida' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <input
              {...register('marca')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
            <select
              {...register('unidadMedidaId', { required: 'La unidad de medida es requerida', valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione...</option>
              {unidadesMedidaActivas?.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>{unidad.descripcion}</option>
              ))}
            </select>
            {errors.unidadMedidaId && <p className="mt-1 text-sm text-red-600">{errors.unidadMedidaId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Existencia</label>
            <input
              type="number"
              step="0.01"
              {...register('existencia', { valueAsNumber: true, min: 0 })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              {...register('estado', { required: 'El estado es requerido' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                reset({
                  descripcion: '',
                  marca: '',
                  unidadMedidaId: 0,
                  existencia: 0,
                  estado: 'Activo',
                })
                setEditingArticulo(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {editingArticulo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setArticuloToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Desactivar Artículo"
        message={`¿Está seguro de desactivar el artículo "${articuloToDelete?.descripcion}"? Podrá reactivarlo más tarde desde la vista de inactivos.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

