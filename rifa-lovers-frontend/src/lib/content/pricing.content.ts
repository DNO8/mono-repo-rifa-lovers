import type { PricingTier } from '@/types/domain.types'

// IDs de packs correspondientes a los creados en la base de datos
const PACK_IDS = {
  basic: 'b2f93595-f9f6-41ae-9c15-6078326c',  // Pack Básico
  popular: 'eb473bad-83c1-42b5-a13d-9f803a6b7ea3',  // Pack Popular
  max: '1f35d291-bd1f-4964-8a6c-2f2f68cdda1f',  // Pack Máximo
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-basic',
    packId: PACK_IDS.basic,
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
    packId: PACK_IDS.popular,
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
    packId: PACK_IDS.max,
    name: 'Máximo',
    tickets: 5,
    price: 9990,
    bonusTickets: 0,
    tagline: 'Máximas oportunidades',
    cta: 'Maximizar oportunidades',
    popular: false,
  },
]
