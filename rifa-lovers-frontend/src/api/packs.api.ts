import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Pack } from '@/types/domain.types'

export async function getPacks(): Promise<Pack[]> {
  return apiClient.get<Pack[]>(ENDPOINTS.packs.list)
}

export async function getPackById(id: string): Promise<Pack> {
  return apiClient.get<Pack>(ENDPOINTS.packs.detail(id))
}
