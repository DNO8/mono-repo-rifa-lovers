import type { Raffle, PricingTier } from '@/types/domain.types'

export const ACTIVE_RAFFLE: Raffle = {
  id: 'raffle-001',
  name: 'MacBook Air M5',
  description: 'MacBook Air M5 13.6" — Apple Chip M5 de 10 núcleos, 16 GB RAM, 512 GB SSD, macOS. Pantalla Liquid Retina. Nuevo sellado con garantía Apple.',
  prize: 'MacBook Air M5',
  prizeImage: '/prize-placeholder.webp',
  ticketPrice: 2990,
  totalTickets: 5000,
  soldCount: 1200,
  progress: 24,
  drawDate: '2025-04-06T23:00:00.000Z',
  isActive: true,
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-basic',
    name: 'Básico',
    tickets: 1,
    price: 2990,
    bonusTickets: 0,
    tagline: 'Para probar suerte',
    cta: 'Probar ahora',
    popular: false,
  },
  {
    id: 'tier-popular',
    name: 'Popular',
    tickets: 2,
    price: 4990,
    bonusTickets: 0,
    tagline: 'El favorito de la comunidad',
    cta: 'Participar ahora',
    popular: true,
    benefits: ['Mejor precio por LuckyPass', 'Generas impacto real'],
  },
  {
    id: 'tier-max',
    name: 'Máximo',
    tickets: 5,
    price: 9990,
    bonusTickets: 0,
    tagline: 'Máximas oportunidades',
    cta: 'Maximizar oportunidades',
    popular: false,
  },
]
