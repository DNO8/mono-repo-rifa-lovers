import { apiClient } from './api-client'
import type { CustomerDrawAvailability, CustomerDrawResult, RaffleDetails } from '@/types/streaming.types'
import { parseApiResponse, isCustomerDrawAvailability, isCustomerDrawResult, isRaffleDetails } from '@/utils/type-guards'

// Streaming Service - High cohesion, single responsibility
export class StreamingService {
  // Raffle operations
  async getRaffle(raffleId: string): Promise<RaffleDetails> {
    const data = await apiClient.get(`/raffles/${raffleId}`)
    return parseApiResponse(data, isRaffleDetails, 'Formato de rifa inválido')
  }

  // Draw operations
  async checkDrawAvailability(raffleId: string): Promise<CustomerDrawAvailability> {
    const data = await apiClient.get(`/customer/draw/${raffleId}/check`)
    return parseApiResponse(data, isCustomerDrawAvailability, 'Formato de disponibilidad inválido')
  }

  async executeDraw(raffleId: string): Promise<CustomerDrawResult> {
    const data = await apiClient.post(`/customer/draw/${raffleId}`)
    return parseApiResponse(data, isCustomerDrawResult, 'Formato de resultado de sorteo inválido')
  }
}

// Singleton instance for dependency injection
export const streamingService = new StreamingService()

// Factory function for testing and dependency injection
export function createStreamingService(): StreamingService {
  return new StreamingService()
}
