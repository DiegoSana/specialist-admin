import axios from 'axios'
import { LoginDTO, AuthResponse } from '@specialist/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
  },
  getMe: async () => {
    const response = await api.get('/users/me')
    return response.data
  },
}

