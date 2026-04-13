import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

export interface DrawWinner {
  prizeId: string
  prizeName: string
  prizeDescription: string | null
  luckyPassId: string
  passNumber: number
  userId: string
  userName: string | null
  userEmail: string | null
}

export interface DrawResults {
  raffleId: string
  drawnAt: string
  winners: DrawWinner[]
}

export interface DrawCheckResponse {
  canDraw: boolean
  reason?: string
  prizesCount: number
  activePassesCount: number
}

/**
 * Obtener resultados del sorteo (público)
 */
export async function getDrawResults(raffleId: string): Promise<DrawResults | null> {
  return apiClient.get<DrawResults>(ENDPOINTS.draw.results(raffleId))
}

/**
 * Verificar si se puede ejecutar sorteo (admin)
 */
export async function checkDrawAvailability(raffleId: string): Promise<DrawCheckResponse> {
  return apiClient.get<DrawCheckResponse>(ENDPOINTS.draw.check(raffleId))
}

/**
 * Ejecutar sorteo (admin only)
 */
export async function executeDraw(raffleId: string): Promise<DrawResults> {
  return apiClient.post<DrawResults>(ENDPOINTS.draw.execute(raffleId))
}
