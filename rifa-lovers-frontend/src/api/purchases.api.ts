import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Purchase, CreatePurchaseRequest, CreatePurchaseResponse, Pack } from '@/types/domain.types'

export async function getMyPurchases(): Promise<Purchase[]> {
  return apiClient.get<Purchase[]>(ENDPOINTS.purchases.my)
}

export async function getPacks(): Promise<Pack[]> {
  return apiClient.get<Pack[]>(ENDPOINTS.packs.list)
}

export async function getPackById(id: string): Promise<Pack> {
  return apiClient.get<Pack>(ENDPOINTS.packs.detail(id))
}

export async function createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
  return apiClient.post<CreatePurchaseResponse>(ENDPOINTS.purchases.create, data)
}

export async function createFreePurchase(data: {
  raffleId: string
  packId: string
  quantity: number
  selectedNumbers?: number[]
}): Promise<CreatePurchaseResponse> {
  return apiClient.post<CreatePurchaseResponse>('/purchases/free', data)
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
