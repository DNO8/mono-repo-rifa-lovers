import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Purchase } from '@/types/domain.types'

export async function getMyPurchases(): Promise<Purchase[]> {
  return apiClient.get<Purchase[]>(ENDPOINTS.purchases.my)
}
