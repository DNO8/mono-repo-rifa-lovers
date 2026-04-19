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
  'One': {
    tagline: 'Tu entrada a la experiencia RifaLovers.',
    cta: 'Activar One',
    benefits: ['1 LuckyPass', 'Producto digital de campaña', 'Acceso experiencia RifaLovers'],
  },
  'Flow': {
    tagline: 'Más oportunidades, mejor valor y energía ganadora.',
    cta: 'Activar Flow',
    benefits: ['3 LuckyPass', 'Producto digital de campaña', 'Mejor valor para participar'],
  },
  'Max': {
    tagline: 'La opción más potente para quienes quieren ir con todo.',
    cta: 'Activar Max',
    benefits: ['5 LuckyPass', 'Producto digital de campaña', 'Opción premium'],
  },
}

export const DEFAULT_PACK_UI_META: PackUIMeta = {
  tagline: 'Participa y gana',
  cta: 'Participar ahora',
}
