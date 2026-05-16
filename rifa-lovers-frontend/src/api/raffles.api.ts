import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Raffle, RaffleProgress, Pack } from '@/types/domain.types'

export async function getActiveRaffle(): Promise<Raffle | null> {
  return apiClient.get<Raffle>(ENDPOINTS.raffles.active)
}

export async function getActiveRaffleProgress(): Promise<RaffleProgress | null> {
  return apiClient.get<RaffleProgress>(ENDPOINTS.raffles.activeProgress)
}

export async function getPublicRaffles(): Promise<Raffle[]> {
  return apiClient.get<Raffle[]>(ENDPOINTS.raffles.public)
}

export async function getUserRaffles(): Promise<Raffle[]> {
  return apiClient.get<Raffle[]>('/raffles/user')
}

export async function getRaffleById(raffleId: string): Promise<Raffle | null> {
  return apiClient.get<Raffle>(ENDPOINTS.raffles.detail(raffleId))
}

export async function getRafflePacks(raffleId: string): Promise<Pack[]> {
  return apiClient.get<Pack[]>(ENDPOINTS.raffles.packs(raffleId))
}

export async function getRaffleProgress(raffleId: string): Promise<RaffleProgress | null> {
  return apiClient.get<RaffleProgress>(ENDPOINTS.raffles.progress(raffleId))
}
