import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Proveedor, ApiResponse } from '../types'

const getProveedores = async (): Promise<Proveedor[]> => {
  const { data } = await api.get<ApiResponse<Proveedor[]>>('/proveedores')
  return data.data
}

const getProveedor = async (id: number): Promise<Proveedor> => {
  const { data } = await api.get<ApiResponse<Proveedor>>(`/proveedores/${id}`)
  return data.data
}

const createProveedor = async (proveedor: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
  const { data } = await api.post<ApiResponse<Proveedor>>('/proveedores', proveedor)
  return data.data
}

const updateProveedor = async ({ id, ...proveedor }: Partial<Proveedor> & { id: number }): Promise<Proveedor> => {
  const { data } = await api.put<ApiResponse<Proveedor>>(`/proveedores/${id}`, proveedor)
  return data.data
}

const deleteProveedor = async (id: number): Promise<void> => {
  await api.delete(`/proveedores/${id}`)
}

export const useProveedores = () => {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: getProveedores,
  })
}

export const useProveedor = (id: number) => {
  return useQuery({
    queryKey: ['proveedores', id],
    queryFn: () => getProveedor(id),
    enabled: !!id,
  })
}

export const useCreateProveedor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    },
  })
}

export const useUpdateProveedor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProveedor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
      queryClient.invalidateQueries({ queryKey: ['proveedores', data.id] })
    },
  })
}

export const useDeleteProveedor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    },
  })
}

