import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejar errores y extraer mensajes del backend
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; message: string; errors?: any[] }>) => {
    // Extraer el mensaje de error del backend si existe
    if (error.response?.data?.message) {
      error.message = error.response.data.message
    }
    return Promise.reject(error)
  }
)

export default api

