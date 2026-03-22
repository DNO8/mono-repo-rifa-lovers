/**
 * User Adapter — transforms raw API user responses into domain types.
 */

import type { UserApiResponse, AuthApiResponse } from '@/types/api.types'
import type { User, AuthResponse } from '@/types/domain.types'

export function toUser(raw: UserApiResponse): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    avatar: raw.avatar,
  }
}

export function toAuthResponse(raw: AuthApiResponse): AuthResponse {
  return {
    user: toUser(raw.user),
    token: raw.token,
  }
}
