import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { OrdenCompra, ApiResponse } from '../types'

const getOrdenesCompra = async (): Promise<OrdenCompra[]> => {
  const { data } = await api.get<ApiResponse<OrdenCompra[]>>('/ordenes-compra')
  return data.data
}

const getOrdenCompra = async (id: number): Promise<OrdenCompra> => {
  const { data } = await api.get<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}`)
  return data.data
}

const createOrdenCompra = async (ordenCompra: Omit<OrdenCompra, 'id' | 'numeroOrden'>): Promise<OrdenCompra> => {
  const { data } = await api.post<ApiResponse<OrdenCompra>>('/ordenes-compra', ordenCompra)
  return data.data
}

const updateOrdenCompra = async ({ id, ...ordenCompra }: Partial<OrdenCompra> & { id: number }): Promise<OrdenCompra> => {
  const { data } = await api.put<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}`, ordenCompra)
  return data.data
}

const deleteOrdenCompra = async (id: number): Promise<void> => {
  await api.delete(`/ordenes-compra/${id}`)
}

const consultarPorCriterios = async (criterios: Record<string, any>): Promise<OrdenCompra[]> => {
  const { data } = await api.get<ApiResponse<OrdenCompra[]>>('/ordenes-compra/consulta', { params: criterios })
  return data.data
}

const cambiarEstado = async (id: number, estado: string): Promise<OrdenCompra> => {
  const { data } = await api.patch<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}/estado`, { estado })
  return data.data
}

const getEstadosPosibles = async (id: number): Promise<string[]> => {
  const { data } = await api.get<ApiResponse<string[]>>(`/ordenes-compra/${id}/estados-posibles`)
  return data.data
}

export const useOrdenesCompra = () => {
  return useQuery({
    queryKey: ['ordenes-compra'],
    queryFn: getOrdenesCompra,
  })
}

export const useOrdenCompra = (id: number) => {
  return useQuery({
    queryKey: ['ordenes-compra', id],
    queryFn: () => getOrdenCompra(id),
    enabled: !!id,
  })
}

export const useCreateOrdenCompra = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createOrdenCompra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
    },
  })
}

export const useUpdateOrdenCompra = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateOrdenCompra,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra', data.id] })
    },
  })
}

export const useDeleteOrdenCompra = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteOrdenCompra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
    },
  })
}

export const useConsultarPorCriterios = (criterios: Record<string, any>) => {
  return useQuery({
    queryKey: ['ordenes-compra', 'consulta', criterios],
    queryFn: () => consultarPorCriterios(criterios),
    enabled: Object.keys(criterios).length > 0,
  })
}

export const useCambiarEstado = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => cambiarEstado(id, estado),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra', data.id] })
    },
  })
}

export const useEstadosPosibles = (id: number) => {
  return useQuery({
    queryKey: ['ordenes-compra', id, 'estados-posibles'],
    queryFn: () => getEstadosPosibles(id),
    enabled: !!id,
  })
}

