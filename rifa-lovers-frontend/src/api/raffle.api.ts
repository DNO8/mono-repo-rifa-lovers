/**
 * Raffle API Facade — single entry point for all raffle-related API calls.
 * Consumers use domain types; raw DTO transformation is handled internally.
 */

import { ENDPOINTS } from './endpoints'
import { apiClient } from './client'
import { toRaffle, toDashboardSummary } from './adapters/raffle.adapter'
import type { RaffleApiResponse, DashboardSummaryApiResponse } from '@/types/api.types'
import type { Raffle, DashboardSummary } from '@/types/domain.types'

export const raffleApi = {
  async getActive(): Promise<Raffle[]> {
    const raw = await apiClient.get<RaffleApiResponse[]>(ENDPOINTS.raffles.active)
    return raw.map(toRaffle)
  },

  async getById(id: string): Promise<Raffle> {
    const raw = await apiClient.get<RaffleApiResponse>(ENDPOINTS.raffles.detail(id))
    return toRaffle(raw)
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const raw = await apiClient.get<DashboardSummaryApiResponse>(ENDPOINTS.dashboard.summary)
    return toDashboardSummary(raw)
  },
}
