import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Raffle, RaffleProgress } from '@/types/domain.types'

export async function getActiveRaffle(): Promise<Raffle | null> {
  return apiClient.get<Raffle>(ENDPOINTS.raffles.active)
}

export async function getActiveRaffleProgress(): Promise<RaffleProgress | null> {
  return apiClient.get<RaffleProgress>(ENDPOINTS.raffles.activeProgress)
}

export async function getUserRaffles(): Promise<Raffle[]> {
  return apiClient.get<Raffle[]>('/raffles/user')
}
