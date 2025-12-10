import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { AsientoContable, ApiResponse } from '../types'
import toast from 'react-hot-toast'

export const useAsientosContables = (filters?: {
  estado?: string
  ordenCompraId?: number
  fechaDesde?: string
  fechaHasta?: string
  tipoMovimiento?: string
}) => {
  const queryClient = useQueryClient()

  const queryParams = new URLSearchParams()
  if (filters?.estado) queryParams.append('estado', filters.estado)
  if (filters?.ordenCompraId) queryParams.append('ordenCompraId', filters.ordenCompraId.toString())
  if (filters?.fechaDesde) queryParams.append('fechaDesde', filters.fechaDesde)
  if (filters?.fechaHasta) queryParams.append('fechaHasta', filters.fechaHasta)
  if (filters?.tipoMovimiento) queryParams.append('tipoMovimiento', filters.tipoMovimiento)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['asientosContables', filters],
    queryFn: async () => {
      const url = `/asientos-contables${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await api.get<ApiResponse<AsientoContable[]>>(url)
      return response.data.data
    },
  })

  return {
    asientos: data || [],
    isLoading,
    error,
    refetch,
  }
}

export const useTransaccionesPendientes = (fechaDesde?: string, fechaHasta?: string) => {
  const queryParams = new URLSearchParams()
  if (fechaDesde) queryParams.append('fechaDesde', fechaDesde)
  if (fechaHasta) queryParams.append('fechaHasta', fechaHasta)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transaccionesPendientes', fechaDesde, fechaHasta],
    queryFn: async () => {
      const url = `/asientos-contables/pendientes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await api.get<ApiResponse<AsientoContable[]>>(url)
      return response.data.data
    },
  })

  return {
    transacciones: data || [],
    isLoading,
    error,
    refetch,
  }
}

export const useContabilizarAsiento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<any>>(`/asientos-contables/${id}/contabilizar`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asientosContables'] })
      queryClient.invalidateQueries({ queryKey: ['transaccionesPendientes'] })
      toast.success('Asiento contabilizado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al contabilizar el asiento')
    },
  })
}

export const useGenerarAsientosDesdeOrden = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ordenCompraId: number) => {
      const response = await api.post<ApiResponse<AsientoContable[]>>(
        `/asientos-contables/generar/${ordenCompraId}`
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asientosContables'] })
      queryClient.invalidateQueries({ queryKey: ['ordenesCompra'] })
      toast.success('Asientos contables generados exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al generar asientos contables')
    },
  })
}

