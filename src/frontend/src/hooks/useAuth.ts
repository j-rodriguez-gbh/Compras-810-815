import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { LoginRequest, RegisterRequest, AuthResponse, Usuario, ApiResponse } from '../types'
import toast from 'react-hot-toast'

const AUTH_KEY = 'auth'

const getStoredUser = (): Usuario | null => {
  const stored = localStorage.getItem('usuario')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

const getStoredToken = (): string | null => {
  return localStorage.getItem('token')
}

export const useAuth = () => {
  const [user, setUser] = useState<Usuario | null>(getStoredUser())
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = getStoredToken()
    const storedUser = getStoredUser()
    if (token && storedUser) {
      setUser(storedUser)
    }
  }, [])

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
      return response.data.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      setUser(data.usuario)
      queryClient.setQueryData([AUTH_KEY], data.usuario)
      toast.success('Login exitoso')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar sesión')
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
      return response.data.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      setUser(data.usuario)
      queryClient.setQueryData([AUTH_KEY], data.usuario)
      toast.success('Registro exitoso')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar usuario')
    },
  })

  const { data: currentUser } = useQuery({
    queryKey: [AUTH_KEY],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Usuario>>('/auth/me')
      return response.data.data
    },
    enabled: !!getStoredToken(),
    retry: false,
  })

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
      localStorage.setItem('usuario', JSON.stringify(currentUser))
    }
  }, [currentUser])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUser(null)
    queryClient.clear()
    toast.success('Sesión cerrada')
  }

  const login = (credentials: LoginRequest) => {
    return loginMutation.mutateAsync(credentials)
  }

  const register = (data: RegisterRequest) => {
    return registerMutation.mutateAsync(data)
  }

  const isAuthenticated = !!user && !!getStoredToken()

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  }
}

