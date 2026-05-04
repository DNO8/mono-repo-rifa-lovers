import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { User } from '@/types/domain.types'

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string
  newPassword?: string
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  return apiClient.patch<User>(ENDPOINTS.users.update, payload)
}
