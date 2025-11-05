import { useState, useEffect } from 'react'
import { useProveedores, useCreateProveedor, useUpdateProveedor, useDeleteProveedor } from '../../hooks/useProveedores'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useForm } from 'react-hook-form'
import { Proveedor } from '../../types'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

export default function ProveedoresPage() {
  const { data: proveedores, isLoading } = useProveedores()
  const createMutation = useCreateProveedor()
  const updateMutation = useUpdateProveedor()
  const deleteMutation = useDeleteProveedor()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null)
  const [showInactivos, setShowInactivos] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Proveedor, 'id'>>()

  const onSubmit = async (data: Omit<Proveedor, 'id'>) => {
    try {
      if (editingProveedor) {
        await updateMutation.mutateAsync({ id: editingProveedor.id, ...data })
        toast.success('Proveedor actualizado exitosamente')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Proveedor creado exitosamente')
      }
      setIsModalOpen(false)
      reset({
        cedulaRNC: '',
        nombreComercial: '',
        estado: 'Activo',
      })
      setEditingProveedor(null)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al procesar la solicitud')
    }
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    reset(proveedor)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (proveedorToDelete) {
      try {
        await deleteMutation.mutateAsync(proveedorToDelete.id)
        toast.success('Proveedor desactivado exitosamente')
        setProveedorToDelete(null)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(axiosError.message || 'Error al desactivar el proveedor')
      }
    }
  }

  const handleActivate = async (proveedor: Proveedor) => {
    try {
      await updateMutation.mutateAsync({ id: proveedor.id, estado: 'Activo' })
      toast.success('Proveedor activado exitosamente')
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.message || 'Error al activar el proveedor')
    }
  }

  const filteredProveedores = showInactivos
    ? proveedores?.filter(p => p.estado === 'Inactivo')
    : proveedores?.filter(p => p.estado === 'Activo')

  const handleNew = () => {
    setEditingProveedor(null)
    reset({
      cedulaRNC: '',
      nombreComercial: '',
      estado: 'Activo',
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (isModalOpen && !editingProveedor) {
      reset({
        cedulaRNC: '',
        nombreComercial: '',
        estado: 'Activo',
      })
    }
  }, [isModalOpen, editingProveedor, reset])

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Proveedores</h2>
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
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProveedores && filteredProveedores.length > 0 ? (
            filteredProveedores.map((proveedor) => (
            <li key={proveedor.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{proveedor.nombreComercial}</p>
                    <p className="text-sm text-gray-500">Cédula/RNC: {proveedor.cedulaRNC}</p>
                    <p className="text-sm text-gray-500">Estado: {proveedor.estado}</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-[200px] justify-end">
                    {proveedor.estado === 'Activo' ? (
                      <>
                        <button
                          onClick={() => handleEdit(proveedor)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Editar proveedor"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(proveedor)}
                          className="px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Desactivar proveedor"
                        >
                          Desactivar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleActivate(proveedor)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                        title="Activar proveedor"
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
              {showInactivos ? 'No hay proveedores inactivos' : 'No hay proveedores activos'}
            </li>
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          reset({
            cedulaRNC: '',
            nombreComercial: '',
            estado: 'Activo',
          })
          setEditingProveedor(null)
        }}
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula/RNC</label>
            <input
              {...register('cedulaRNC', { required: 'La cédula/RNC es requerida' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.cedulaRNC && <p className="mt-1 text-sm text-red-600">{errors.cedulaRNC.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
            <input
              {...register('nombreComercial', { required: 'El nombre comercial es requerido' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.nombreComercial && <p className="mt-1 text-sm text-red-600">{errors.nombreComercial.message}</p>}
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
                  cedulaRNC: '',
                  nombreComercial: '',
                  estado: 'Activo',
                })
                setEditingProveedor(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {editingProveedor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setProveedorToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Desactivar Proveedor"
        message={`¿Está seguro de desactivar el proveedor "${proveedorToDelete?.nombreComercial}"? Podrá reactivarlo más tarde desde la vista de inactivos.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

