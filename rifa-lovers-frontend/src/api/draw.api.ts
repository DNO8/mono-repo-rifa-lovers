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

export interface AdminDrawWinner extends DrawWinner {
  userPhone: number | null
  userAddress: string | null
}

export interface AdminDrawResults {
  raffleId: string
  drawnAt: string
  winners: AdminDrawWinner[]
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
  return apiClient.get<DrawResults>(ENDPOINTS.raffles.draw.results(raffleId))
}

/**
 * Obtener resultados del sorteo con datos completos (admin/operator)
 */
export async function getAdminDrawResults(raffleId: string): Promise<AdminDrawResults | null> {
  return apiClient.get<AdminDrawResults>(ENDPOINTS.raffles.draw.adminResults(raffleId))
}

/**
 * Verificar si se puede ejecutar sorteo (admin)
 */
export async function checkDrawAvailability(raffleId: string): Promise<DrawCheckResponse> {
  return apiClient.get<DrawCheckResponse>(ENDPOINTS.raffles.draw.check(raffleId))
}

/**
 * Ejecutar sorteo (admin only)
 */
export async function executeDraw(raffleId: string): Promise<DrawResults> {
  return apiClient.post<DrawResults>(ENDPOINTS.raffles.draw.execute(raffleId))
}
