import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Departamento, ApiResponse } from '../types'

const getDepartamentos = async (): Promise<Departamento[]> => {
  const { data } = await api.get<ApiResponse<Departamento[]>>('/departamentos')
  return data.data
}

const getDepartamento = async (id: number): Promise<Departamento> => {
  const { data } = await api.get<ApiResponse<Departamento>>(`/departamentos/${id}`)
  return data.data
}

const createDepartamento = async (departamento: Omit<Departamento, 'id'>): Promise<Departamento> => {
  const { data } = await api.post<ApiResponse<Departamento>>('/departamentos', departamento)
  return data.data
}

const updateDepartamento = async ({ id, ...departamento }: Partial<Departamento> & { id: number }): Promise<Departamento> => {
  const { data } = await api.put<ApiResponse<Departamento>>(`/departamentos/${id}`, departamento)
  return data.data
}

const deleteDepartamento = async (id: number): Promise<void> => {
  await api.delete(`/departamentos/${id}`)
}

export const useDepartamentos = () => {
  return useQuery({
    queryKey: ['departamentos'],
    queryFn: getDepartamentos,
  })
}

export const useDepartamento = (id: number) => {
  return useQuery({
    queryKey: ['departamentos', id],
    queryFn: () => getDepartamento(id),
    enabled: !!id,
  })
}

export const useCreateDepartamento = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createDepartamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
    },
  })
}

export const useUpdateDepartamento = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateDepartamento,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      queryClient.invalidateQueries({ queryKey: ['departamentos', data.id] })
    },
  })
}

export const useDeleteDepartamento = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteDepartamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
    },
  })
}

