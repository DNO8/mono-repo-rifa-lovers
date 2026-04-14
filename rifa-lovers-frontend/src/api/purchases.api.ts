import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Purchase, CreatePurchaseRequest, CreatePurchaseResponse } from '@/types/domain.types'

export async function getMyPurchases(): Promise<Purchase[]> {
  return apiClient.get<Purchase[]>(ENDPOINTS.purchases.my)
}

export async function createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
  return apiClient.post<CreatePurchaseResponse>(ENDPOINTS.purchases.create, data)
}

export async function getPurchaseStatus(id: string): Promise<{ id: string; status: string }> {
  return apiClient.get<{ id: string; status: string }>(ENDPOINTS.purchases.detail(id))
}

export async function checkTicketAvailability(
  raffleId: string,
  ticketNumber: number,
): Promise<{ available: boolean }> {
  return apiClient.get<{ available: boolean }>(
    ENDPOINTS.luckyPasses.checkAvailability(raffleId, ticketNumber),
  )
}
