import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { HttpRequestOptions } from './clients/http-client'
import type { CreateRaffleRequest, UpdateRaffleRequest, UpdateRaffleStatusRequest, RaffleWithStats } from './admin.api'

// ==================== TYPES ====================

export interface OperatorKpiData {
  totalSales: number
  packsSold: number
  activeRaffles: number
  totalPurchases: number
  pendingPurchases: number
  completedPurchases: number
  failedPurchases: number
  totalLuckyPasses: number
  winnersCount: number
}

export interface PackWithStats {
  id: string
  name: string | null
  price: number
  luckyPassQuantity: number
  isFeatured: boolean
  isPreSale: boolean
  raffleId: string | null
  createdAt: string
}

export interface CreatePackRequest {
  name: string
  price: number
  luckyPassQuantity: number
  isFeatured?: boolean
  isPreSale?: boolean
}

export interface UpdatePackRequest {
  name?: string
  price?: number
  luckyPassQuantity?: number
  isFeatured?: boolean
  isPreSale?: boolean
}

export interface OrganizationData {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrganizationRequest {
  name: string
  slug?: string
}

export interface Participant {
  id: string
  name: string
  email: string
  ticketCount: number
  tickets: number[]
}

export interface DrawStatusResponse {
  canExecute: boolean
  results: { winners: { luckyPassId: string; prizeName: string; userName: string; userEmail: string; passNumber: number }[]; drawnAt: string } | null
}

export interface NewsletterCampaign {
  id: string
  subject: string
  body: string
  sentBy: string | null
  sentAt: string | null
  recipientCount: number
  createdAt: string
}

export interface SendOperatorNewsletterRequest {
  subject: string
  body: string
}

export interface SendOperatorNewsletterResponse {
  success: boolean
  message: string
  recipientCount?: number
  remaining: number
}

// ==================== ORGANIZATION ====================

export async function getOperatorOrganization(): Promise<OrganizationData> {
  return apiClient.get<OrganizationData>(ENDPOINTS.operator.organization)
}

export async function createOperatorOrganization(data: CreateOrganizationRequest): Promise<OrganizationData> {
  return apiClient.post<OrganizationData>(ENDPOINTS.operator.organization, data)
}

// ==================== KPIs ====================

export async function getOperatorKpis(): Promise<OperatorKpiData> {
  return apiClient.get<OperatorKpiData>(ENDPOINTS.operator.kpis)
}

// ==================== RIFAS ====================

export async function getOperatorRaffles(): Promise<RaffleWithStats[]> {
  return apiClient.get<RaffleWithStats[]>(ENDPOINTS.operator.raffles)
}

export async function createOperatorRaffle(data: CreateRaffleRequest): Promise<RaffleWithStats> {
  return apiClient.post<RaffleWithStats>(ENDPOINTS.operator.raffles, data)
}

export async function updateOperatorRaffle(raffleId: string, data: UpdateRaffleRequest): Promise<RaffleWithStats> {
  return apiClient.patch<RaffleWithStats>(ENDPOINTS.operator.raffle(raffleId), data)
}

export async function updateOperatorRaffleStatus(raffleId: string, data: UpdateRaffleStatusRequest): Promise<RaffleWithStats> {
  return apiClient.patch<RaffleWithStats>(ENDPOINTS.operator.raffleStatus(raffleId), data)
}

export async function uploadRaffleCover(raffleId: string, file: File): Promise<{ coverImageUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<{ coverImageUrl: string }>(ENDPOINTS.operator.uploadCover(raffleId), formData)
}

// ==================== PACKS ====================

export async function getRafflePacks(raffleId: string): Promise<PackWithStats[]> {
  return apiClient.get<PackWithStats[]>(ENDPOINTS.operator.packs(raffleId))
}

export async function createRafflePack(raffleId: string, data: CreatePackRequest): Promise<PackWithStats> {
  return apiClient.post<PackWithStats>(ENDPOINTS.operator.packs(raffleId), data)
}

export async function updatePack(packId: string, data: UpdatePackRequest): Promise<PackWithStats> {
  return apiClient.patch<PackWithStats>(ENDPOINTS.operator.pack(packId), data)
}

export async function deletePack(packId: string): Promise<void> {
  return apiClient.delete<void>(ENDPOINTS.operator.pack(packId))
}

// ==================== PARTICIPANTS & DRAW ====================

export async function getOperatorParticipants(raffleId: string): Promise<Participant[]> {
  return apiClient.get<Participant[]>(ENDPOINTS.operator.participants(raffleId))
}

export async function getOperatorDrawStatus(raffleId: string): Promise<DrawStatusResponse> {
  return apiClient.get<DrawStatusResponse>(ENDPOINTS.operator.drawStatus(raffleId))
}

export async function executeOperatorDraw(
  raffleId: string,
  prizeId?: string,
  options?: HttpRequestOptions,
): Promise<{ winners: { luckyPassId: string; prizeName: string; userName: string; userEmail: string; passNumber: number }[]; drawnAt: string }> {
  return apiClient.post(ENDPOINTS.operator.drawExecute(raffleId), { prizeId }, options)
}

// ==================== NEWSLETTER ====================

export async function getOperatorNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  return apiClient.get<NewsletterCampaign[]>(ENDPOINTS.operator.newsletterCampaigns)
}

export async function sendOperatorNewsletter(data: SendOperatorNewsletterRequest): Promise<SendOperatorNewsletterResponse> {
  return apiClient.post<SendOperatorNewsletterResponse>(ENDPOINTS.operator.newsletterSend, data)
}
