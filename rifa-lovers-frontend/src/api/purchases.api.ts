import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Purchase, CreatePurchaseRequest, CreatePurchaseResponse } from '@/types/domain.types'

export async function getMyPurchases(): Promise<Purchase[]> {
  return apiClient.get<Purchase[]>(ENDPOINTS.purchases.my)
}

export async function createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
  return apiClient.post<CreatePurchaseResponse>(ENDPOINTS.purchases.create, data)
}
