/**
 * Ticket ViewModel Factory — creates presentation-ready view models
 * from domain types, encapsulating display logic (formatting, labels, colors).
 */

import type { Raffle, PricingTier } from '@/types/domain.types'

export interface TicketViewModel {
  raffleId: string
  raffleName: string
  prizeLabel: string
  formattedPrice: string
  progressPercent: number
  progressLabel: string
  remainingTickets: number
  isAlmostSoldOut: boolean
  drawDateFormatted: string
}

export interface TierViewModel {
  tierId: string
  tierName: string
  ticketCount: number
  formattedPrice: string
  formattedBonusLabel: string | null
  isPopular: boolean
}

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function createTicketViewModel(raffle: Raffle): TicketViewModel {
  const remaining = raffle.totalTickets - raffle.soldCount
  return {
    raffleId: raffle.id,
    raffleName: raffle.name,
    prizeLabel: raffle.prize,
    formattedPrice: CLP.format(raffle.ticketPrice),
    progressPercent: raffle.progress,
    progressLabel: `${raffle.progress}% vendido`,
    remainingTickets: remaining,
    isAlmostSoldOut: remaining <= raffle.totalTickets * 0.1,
    drawDateFormatted: formatDate(raffle.drawDate),
  }
}

export function createTierViewModel(tier: PricingTier): TierViewModel {
  return {
    tierId: tier.id,
    tierName: tier.name,
    ticketCount: tier.tickets,
    formattedPrice: CLP.format(tier.price),
    formattedBonusLabel: tier.bonusTickets > 0
      ? `+${tier.bonusTickets} ticket${tier.bonusTickets > 1 ? 's' : ''} de regalo`
      : null,
    isPopular: tier.popular,
  }
}
