import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '@/types/domain.types'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

const MOCK_USER: User = {
  id: 'user-001',
  name: 'Participante',
  lastName: 'Demo',
  phone: '+56912345678',
  email: 'demo@rifalovers.cl',
  avatar: '👤',
}

const MOCK_TOKEN = 'mock-jwt-token-dev'

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
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
        } catch {
          console.warn('[auth] Backend unavailable, using mock login')
          set({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isLoading: false })
        }
      },

      register: async (name: string, lastName: string, phone: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const data = await apiClient.post<AuthResponse>(ENDPOINTS.auth.register, { name, lastName, phone, email, password })
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
        } catch {
          console.warn('[auth] Backend unavailable, using mock register')
          set({
            user: { ...MOCK_USER, name, email },
            token: MOCK_TOKEN,
            isAuthenticated: true,
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
