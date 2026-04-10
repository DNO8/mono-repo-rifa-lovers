/**
 * Raw API response types — only types that don't map 1:1 to domain types.
 * Most backend DTOs already use camelCase and match domain.types.ts directly.
 */

export interface ContactApiPayload {
  name: string
  email: string
  message: string
}

export interface ApiErrorResponse {
  message: string
  code?: string
  details?: Record<string, string[]>
}
