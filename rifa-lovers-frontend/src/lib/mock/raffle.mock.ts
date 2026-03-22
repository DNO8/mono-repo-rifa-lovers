import type { Raffle, PricingTier } from '@/types/domain.types'

export const ACTIVE_RAFFLE: Raffle = {
  id: 'raffle-001',
  name: 'PC Gamer RTX 4080',
  description: 'Una PC Gamer de última generación con RTX 4080, 32GB RAM y monitor 4K.',
  prize: 'PC Gamer RTX 4080',
  prizeImage: '/prize-placeholder.webp',
  ticketPrice: 2000,
  totalTickets: 10000,
  soldCount: 8200,
  progress: 82,
  drawDate: '2025-04-06T23:00:00.000Z',
  isActive: true,
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-basic',
    name: 'Básico',
    tickets: 1,
    price: 2000,
    bonusTickets: 0,
    tagline: 'Para probar',
    cta: 'Probar ahora',
    popular: false,
  },
  {
    id: 'tier-popular',
    name: 'Popular',
    tickets: 5,
    price: 8000,
    bonusTickets: 1,
    tagline: '+1 ticket de regalo 🎁',
    cta: 'Participar ahora',
    popular: true,
    benefits: ['Participas automáticamente', 'Generas impacto real'],
  },
  {
    id: 'tier-max',
    name: 'Máximo',
    tickets: 10,
    price: 15000,
    bonusTickets: 3,
    tagline: '+3 tickets de regalo 🎁',
    cta: 'Maximizar oportunidades',
    popular: false,
  },
]
