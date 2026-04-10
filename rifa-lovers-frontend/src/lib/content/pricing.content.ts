import type { PricingTier } from '@/types/domain.types'

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
