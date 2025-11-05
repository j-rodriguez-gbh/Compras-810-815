import { useState, useEffect } from 'react'
import { useUnidadesMedida, useCreateUnidadMedida, useUpdateUnidadMedida, useDeleteUnidadMedida } from '../../hooks/useUnidadesMedida'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useForm } from 'react-hook-form'
import { UnidadMedida } from '../../types'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

export default function UnidadesMedidaPage() {
  const { data: unidadesMedida, isLoading } = useUnidadesMedida()
  const createMutation = useCreateUnidadMedida()
  const updateMutation = useUpdateUnidadMedida()
  const deleteMutation = useDeleteUnidadMedida()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnidad, setEditingUnidad] = useState<UnidadMedida | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [unidadToDelete, setUnidadToDelete] = useState<UnidadMedida | null>(null)
  const [showInactivos, setShowInactivos] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<UnidadMedida, 'id'>>()

  const onSubmit = async (data: Omit<UnidadMedida, 'id'>) => {
    try {
      if (editingUnidad) {
        await updateMutation.mutateAsync({ id: editingUnidad.id, ...data })
        toast.success('Unidad de medida actualizada exitosamente')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Unidad de medida creada exitosamente')
      }
      setIsModalOpen(false)
      reset({
        descripcion: '',
        estado: 'Activo',
      })
      setEditingUnidad(null)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al procesar la solicitud')
    }
  }

  const handleEdit = (unidad: UnidadMedida) => {
    setEditingUnidad(unidad)
    reset(unidad)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (unidad: UnidadMedida) => {
    setUnidadToDelete(unidad)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (unidadToDelete) {
      try {
        await deleteMutation.mutateAsync(unidadToDelete.id)
        toast.success('Unidad de medida desactivada exitosamente')
        setUnidadToDelete(null)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(axiosError.message || 'Error al desactivar la unidad de medida')
      }
    }
  }

  const handleActivate = async (unidad: UnidadMedida) => {
    try {
      await updateMutation.mutateAsync({ id: unidad.id, estado: 'Activo' })
      toast.success('Unidad de medida activada exitosamente')
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al activar la unidad de medida')
    }
  }

  const filteredUnidades = showInactivos
    ? unidadesMedida?.filter(u => u.estado === 'Inactivo')
    : unidadesMedida?.filter(u => u.estado === 'Activo')

  const handleNew = () => {
    setEditingUnidad(null)
    reset({
      descripcion: '',
      estado: 'Activo',
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (isModalOpen && !editingUnidad) {
      reset({
        descripcion: '',
        estado: 'Activo',
      })
    }
  }, [isModalOpen, editingUnidad, reset])

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Unidades de Medida</h2>
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
            Nueva Unidad
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUnidades && filteredUnidades.length > 0 ? (
            filteredUnidades.map((unidad) => (
            <li key={unidad.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{unidad.descripcion}</p>
                    <p className="text-sm text-gray-500">Estado: {unidad.estado}</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-[200px] justify-end">
                    {unidad.estado === 'Activo' ? (
                      <>
                        <button
                          onClick={() => handleEdit(unidad)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Editar unidad de medida"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(unidad)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Desactivar unidad de medida"
                        >
                          Desactivar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleActivate(unidad)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                        title="Activar unidad de medida"
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
              {showInactivos ? 'No hay unidades de medida inactivas' : 'No hay unidades de medida activas'}
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
            estado: 'Activo',
          })
          setEditingUnidad(null)
        }}
        title={editingUnidad ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
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
                  estado: 'Activo',
                })
                setEditingUnidad(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {editingUnidad ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setUnidadToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Desactivar Unidad de Medida"
        message={`¿Está seguro de desactivar la unidad de medida "${unidadToDelete?.descripcion}"? Podrá reactivarla más tarde desde la vista de inactivos.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

