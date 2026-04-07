import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { LuckyPass, LuckyPassSummary } from '@/types/domain.types'

export async function getMyLuckyPasses(): Promise<LuckyPass[]> {
  return apiClient.get<LuckyPass[]>(ENDPOINTS.luckyPasses.my)
}

export async function getMyLuckyPassesSummary(): Promise<LuckyPassSummary> {
  return apiClient.get<LuckyPassSummary>(ENDPOINTS.luckyPasses.mySummary)
}
