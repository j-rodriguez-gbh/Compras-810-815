import { useState, useEffect } from 'react'
import { useDepartamentos, useCreateDepartamento, useUpdateDepartamento, useDeleteDepartamento } from '../../hooks/useDepartamentos'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useForm } from 'react-hook-form'
import { Departamento } from '../../types'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

export default function DepartamentosPage() {
  const { data: departamentos, isLoading } = useDepartamentos()
  const createMutation = useCreateDepartamento()
  const updateMutation = useUpdateDepartamento()
  const deleteMutation = useDeleteDepartamento()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [departamentoToDelete, setDepartamentoToDelete] = useState<Departamento | null>(null)
  const [showInactivos, setShowInactivos] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Departamento, 'id'>>()

  const onSubmit = async (data: Omit<Departamento, 'id'>) => {
    try {
      if (editingDepartamento) {
        await updateMutation.mutateAsync({ id: editingDepartamento.id, ...data })
        toast.success('Departamento actualizado exitosamente')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Departamento creado exitosamente')
      }
      setIsModalOpen(false)
      reset({
        nombre: '',
        estado: 'Activo',
      })
      setEditingDepartamento(null)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al procesar la solicitud')
    }
  }

  const handleEdit = (departamento: Departamento) => {
    setEditingDepartamento(departamento)
    reset(departamento)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (departamento: Departamento) => {
    setDepartamentoToDelete(departamento)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (departamentoToDelete) {
      try {
        await deleteMutation.mutateAsync(departamentoToDelete.id)
        toast.success('Departamento desactivado exitosamente')
        setDepartamentoToDelete(null)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(axiosError.message || 'Error al desactivar el departamento')
      }
    }
  }

  const handleActivate = async (departamento: Departamento) => {
    try {
      await updateMutation.mutateAsync({ id: departamento.id, estado: 'Activo' })
      toast.success('Departamento activado exitosamente')
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al activar el departamento')
    }
  }

  const filteredDepartamentos = showInactivos
    ? departamentos?.filter(d => d.estado === 'Inactivo')
    : departamentos?.filter(d => d.estado === 'Activo')

  const handleNew = () => {
    setEditingDepartamento(null)
    reset({
      nombre: '',
      estado: 'Activo',
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (isModalOpen && !editingDepartamento) {
      reset({
        nombre: '',
        estado: 'Activo',
      })
    }
  }, [isModalOpen, editingDepartamento, reset])

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Departamentos</h2>
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
            Nuevo Departamento
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDepartamentos && filteredDepartamentos.length > 0 ? (
            filteredDepartamentos.map((departamento) => (
            <li key={departamento.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{departamento.nombre}</p>
                    <p className="text-sm text-gray-500">Estado: {departamento.estado}</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-[200px] justify-end">
                    {departamento.estado === 'Activo' ? (
                      <>
                        <button
                          onClick={() => handleEdit(departamento)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Editar departamento"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(departamento)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Desactivar departamento"
                        >
                          Desactivar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleActivate(departamento)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                        title="Activar departamento"
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
              {showInactivos ? 'No hay departamentos inactivos' : 'No hay departamentos activos'}
            </li>
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          reset({
            nombre: '',
            estado: 'Activo',
          })
          setEditingDepartamento(null)
        }}
        title={editingDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              {...register('nombre', { required: 'El nombre es requerido' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
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
                  nombre: '',
                  estado: 'Activo',
                })
                setEditingDepartamento(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {editingDepartamento ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setDepartamentoToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Desactivar Departamento"
        message={`¿Está seguro de desactivar el departamento "${departamentoToDelete?.nombre}"? Podrá reactivarlo más tarde desde la vista de inactivos.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

