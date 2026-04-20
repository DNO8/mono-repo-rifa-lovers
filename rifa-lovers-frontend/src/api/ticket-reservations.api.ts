import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { TicketReservation, ReserveTicketsRequest } from '@/types/domain.types'

export async function reserveTickets(data: ReserveTicketsRequest): Promise<TicketReservation[]> {
  return apiClient.post<TicketReservation[]>(ENDPOINTS.ticketReservations.reserve, data)
}

export async function getMyReservations(): Promise<TicketReservation[]> {
  return apiClient.get<TicketReservation[]>(ENDPOINTS.ticketReservations.mine)
}

export async function getReservationsByPurchase(purchaseId: string): Promise<TicketReservation[]> {
  return apiClient.get<TicketReservation[]>(ENDPOINTS.ticketReservations.byPurchase(purchaseId))
}

export async function releaseReservations(purchaseId: string): Promise<void> {
  await apiClient.delete<void>(ENDPOINTS.ticketReservations.release(purchaseId))
}
