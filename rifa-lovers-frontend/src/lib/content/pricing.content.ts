/**
 * Metadata de UI para packs — indexada por nombre de pack.
 * Los datos reales (id, price, luckyPassQuantity) vienen del API via usePacks().
 * Solo contiene taglines, CTAs y benefits para la presentación visual.
 */
export interface PackUIMeta {
  tagline: string
  cta: string
  benefits?: string[]
}

export const PACK_UI_META: Record<string, PackUIMeta> = {
  'Pack Básico': {
    tagline: 'Para probar suerte',
    cta: 'Probar ahora',
  },
  'Pack Popular': {
    tagline: 'El favorito de la comunidad',
    cta: 'Participar ahora',
    benefits: ['Mejor precio por LuckyPass', 'Generas impacto real'],
  },
  'Pack Premium': {
    tagline: 'Máximas oportunidades',
    cta: 'Maximizar oportunidades',
  },
}

export const DEFAULT_PACK_UI_META: PackUIMeta = {
  tagline: 'Participa y gana',
  cta: 'Participar ahora',
}
