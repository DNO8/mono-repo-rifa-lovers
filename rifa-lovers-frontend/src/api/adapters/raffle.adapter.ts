/**
 * Raffle Adapter — transforms raw API responses into domain types.
 * Isolates the frontend from backend DTO changes (snake_case → camelCase).
 */

import type { RaffleApiResponse, OrderApiResponse, DashboardSummaryApiResponse } from '@/types/api.types'
import type { Raffle, Order, DashboardSummary } from '@/types/domain.types'

export function toRaffle(raw: RaffleApiResponse): Raffle {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    prize: raw.prize,
    prizeImage: raw.prize_image,
    ticketPrice: raw.ticket_price,
    totalTickets: raw.total_tickets,
    soldCount: raw.sold_count,
    progress: raw.progress,
    drawDate: raw.draw_date,
    isActive: raw.is_active,
  }
}

export function toOrder(raw: OrderApiResponse): Order {
  return {
    id: raw.id,
    raffleId: raw.raffle_id,
    raffleName: raw.raffle_name,
    ticketCount: raw.ticket_count,
    bonusTickets: raw.bonus_tickets,
    total: raw.total,
    status: raw.status,
    createdAt: raw.created_at,
  }
}

export function toDashboardSummary(raw: DashboardSummaryApiResponse): DashboardSummary {
  return {
    totalTickets: raw.total_tickets,
    points: raw.points,
    activeRaffle: raw.active_raffle ? toRaffle(raw.active_raffle) : null,
    history: raw.history.map(toOrder),
  }
}
