/**
 * Auth API Facade — single entry point for all auth-related API calls.
 */

import { ENDPOINTS } from './endpoints'
import { apiClient } from './client'
import { toAuthResponse, toUser } from './adapters/user.adapter'
import type { AuthApiResponse, UserApiResponse } from '@/types/api.types'
import type { AuthResponse, User } from '@/types/domain.types'

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const raw = await apiClient.post<AuthApiResponse>(ENDPOINTS.auth.login, { email, password })
    return toAuthResponse(raw)
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const raw = await apiClient.post<AuthApiResponse>(ENDPOINTS.auth.register, { name, email, password })
    return toAuthResponse(raw)
  },

  async me(): Promise<User> {
    const raw = await apiClient.get<UserApiResponse>(ENDPOINTS.auth.me)
    return toUser(raw)
  },

  async logout(): Promise<void> {
    await apiClient.post<void>(ENDPOINTS.auth.logout)
  },
}
