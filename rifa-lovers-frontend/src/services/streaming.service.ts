import { apiClient } from '@/api/client'
import type { CustomerDrawAvailability, CustomerDrawResult, RaffleDetails, Participant } from '@/types/streaming.types'
import { parseApiResponse, isCustomerDrawAvailability, isCustomerDrawResult, isRaffleDetails } from '@/utils/type-guards'

// Admin Draw Status response type
export interface AdminDrawStatus {
  canExecute: boolean
  results: CustomerDrawResult | null
}

// Streaming Service - High cohesion, single responsibility
export class StreamingService {
  // ==================== CUSTOMER ENDPOINTS ====================

  async getRaffle(raffleId: string): Promise<RaffleDetails> {
    const data = await apiClient.get(`/raffles/${raffleId}`)
    return parseApiResponse(data, isRaffleDetails, 'Formato de rifa inválido')
  }

  async checkDrawAvailability(raffleId: string): Promise<CustomerDrawAvailability> {
    const data = await apiClient.get(`/customer/draw/${raffleId}/check`)
    return parseApiResponse(data, isCustomerDrawAvailability, 'Formato de disponibilidad inválido')
  }

  async executeDraw(raffleId: string): Promise<CustomerDrawResult> {
    const data = await apiClient.post(`/customer/draw/${raffleId}`)
    return parseApiResponse(data, isCustomerDrawResult, 'Formato de resultado de sorteo inválido')
  }

  // ==================== ADMIN/OPERATOR ENDPOINTS ====================

  async getAdminRaffle(raffleId: string): Promise<RaffleDetails> {
    const data = await apiClient.get(`/admin/raffles/${raffleId}/detail`)
    return parseApiResponse(data, isRaffleDetails, 'Formato de rifa inválido')
  }

  async getAdminParticipants(raffleId: string): Promise<Participant[]> {
    const data = await apiClient.get(`/admin/raffles/${raffleId}/participants`)
    return data as Participant[]
  }

  async getAdminDrawStatus(raffleId: string): Promise<AdminDrawStatus> {
    const data = await apiClient.get(`/admin/raffles/${raffleId}/draw/status`)
    return data as AdminDrawStatus
  }

  async executeAdminDraw(raffleId: string): Promise<CustomerDrawResult> {
    const data = await apiClient.post(`/admin/raffles/${raffleId}/draw`)
    return parseApiResponse(data, isCustomerDrawResult, 'Formato de resultado de sorteo inválido')
  }
}

// Singleton instance for dependency injection
export const streamingService = new StreamingService()

// Factory function for testing and dependency injection
export function createStreamingService(): StreamingService {
  return new StreamingService()
}
