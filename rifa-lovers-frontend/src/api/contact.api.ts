import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { ContactApiPayload } from '@/types/api.types'

export async function submitContactForm(payload: ContactApiPayload): Promise<{ message: string }> {
  return apiClient.post(ENDPOINTS.contact, payload)
}
