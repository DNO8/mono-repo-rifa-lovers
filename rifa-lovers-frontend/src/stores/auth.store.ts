import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-toastify'
import type { User, AuthResponse } from '@/types/domain.types'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, lastName: string, phone: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null })
      try {
        const data = await apiClient.post<AuthResponse>(ENDPOINTS.auth.login, { email, password })
        set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false })
        toast.success('¡Bienvenido de vuelta!')
      } catch (err: any) {
        const message = err.message || 'Error al iniciar sesión'
        set({ error: message, isLoading: false })
        toast.error(message)
        throw err
      }
    },

    register: async (name: string, lastName: string, phone: string, email: string, password: string) => {
      set({ isLoading: true, error: null })
      try {
        const data = await apiClient.post<AuthResponse>(ENDPOINTS.auth.register, { firstName: name, lastName, phone, email, password })
        set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false })
        toast.success('¡Registro exitoso! Bienvenido a RifaLovers')
      } catch (err: any) {
        const message = err.message || 'Error al registrarse'
        set({ error: message, isLoading: false })
        toast.error(message)
        throw err
      }
    },

    logout: () => {
      set({ user: null, token: null, isAuthenticated: false, error: null })
      toast.info('Sesión cerrada')
    },

    clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
