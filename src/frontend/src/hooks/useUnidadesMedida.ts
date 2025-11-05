import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { UnidadMedida, ApiResponse } from '../types'

const getUnidadesMedida = async (): Promise<UnidadMedida[]> => {
  const { data } = await api.get<ApiResponse<UnidadMedida[]>>('/unidades-medida')
  return data.data
}

const getUnidadMedida = async (id: number): Promise<UnidadMedida> => {
  const { data } = await api.get<ApiResponse<UnidadMedida>>(`/unidades-medida/${id}`)
  return data.data
}

const createUnidadMedida = async (unidadMedida: Omit<UnidadMedida, 'id'>): Promise<UnidadMedida> => {
  const { data } = await api.post<ApiResponse<UnidadMedida>>('/unidades-medida', unidadMedida)
  return data.data
}

const updateUnidadMedida = async ({ id, ...unidadMedida }: Partial<UnidadMedida> & { id: number }): Promise<UnidadMedida> => {
  const { data } = await api.put<ApiResponse<UnidadMedida>>(`/unidades-medida/${id}`, unidadMedida)
  return data.data
}

const deleteUnidadMedida = async (id: number): Promise<void> => {
  await api.delete(`/unidades-medida/${id}`)
}

export const useUnidadesMedida = () => {
  return useQuery({
    queryKey: ['unidades-medida'],
    queryFn: getUnidadesMedida,
  })
}

export const useUnidadMedida = (id: number) => {
  return useQuery({
    queryKey: ['unidades-medida', id],
    queryFn: () => getUnidadMedida(id),
    enabled: !!id,
  })
}

export const useCreateUnidadMedida = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createUnidadMedida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-medida'] })
    },
  })
}

export const useUpdateUnidadMedida = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUnidadMedida,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unidades-medida'] })
      queryClient.invalidateQueries({ queryKey: ['unidades-medida', data.id] })
    },
  })
}

export const useDeleteUnidadMedida = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteUnidadMedida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-medida'] })
    },
  })
}

