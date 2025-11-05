import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Articulo, ApiResponse } from '../types'

const getArticulos = async (): Promise<Articulo[]> => {
  const { data } = await api.get<ApiResponse<Articulo[]>>('/articulos')
  return data.data
}

const getArticulo = async (id: number): Promise<Articulo> => {
  const { data } = await api.get<ApiResponse<Articulo>>(`/articulos/${id}`)
  return data.data
}

const createArticulo = async (articulo: Omit<Articulo, 'id'>): Promise<Articulo> => {
  const { data } = await api.post<ApiResponse<Articulo>>('/articulos', articulo)
  return data.data
}

const updateArticulo = async ({ id, ...articulo }: Partial<Articulo> & { id: number }): Promise<Articulo> => {
  const { data } = await api.put<ApiResponse<Articulo>>(`/articulos/${id}`, articulo)
  return data.data
}

const deleteArticulo = async (id: number): Promise<void> => {
  await api.delete(`/articulos/${id}`)
}

export const useArticulos = () => {
  return useQuery({
    queryKey: ['articulos'],
    queryFn: getArticulos,
  })
}

export const useArticulo = (id: number) => {
  return useQuery({
    queryKey: ['articulos', id],
    queryFn: () => getArticulo(id),
    enabled: !!id,
  })
}

export const useCreateArticulo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createArticulo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
    },
  })
}

export const useUpdateArticulo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateArticulo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
      queryClient.invalidateQueries({ queryKey: ['articulos', data.id] })
    },
  })
}

export const useDeleteArticulo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteArticulo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
    },
  })
}

