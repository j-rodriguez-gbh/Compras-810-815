import axios, { AxiosError } from 'axios'

// Normalizar la URL del API
const getApiBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  
  if (!apiUrl) {
    // En desarrollo, usar proxy relativo (ya incluye /api)
    return '/api'
  }
  
  // Normalizar la URL del backend
  let baseUrl = apiUrl
  
  // Si no tiene protocolo, agregar https://
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`
  }
  
  // Asegurar que termine con /api (el backend espera rutas con prefijo /api)
  if (!baseUrl.endsWith('/api')) {
    // Remover trailing slash si existe
    baseUrl = baseUrl.replace(/\/$/, '')
    baseUrl = `${baseUrl}/api`
  }
  
  return baseUrl
}

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores y extraer mensajes del backend
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; message: string; errors?: any[] }>) => {
    // Si el token es inválido o expirado, limpiar localStorage y redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    // Extraer el mensaje de error del backend si existe
    if (error.response?.data?.message) {
      error.message = error.response.data.message
    }
    return Promise.reject(error)
  }
)

export default api

