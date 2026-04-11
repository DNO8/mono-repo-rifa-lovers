import type { Pack, PricingTier } from '@/types/domain.types'

/**
 * Mapea un Pack del backend a un PricingTier para la UI
 * Agrega propiedades de presentación que no vienen del backend
 */
export function mapPackToPricingTier(pack: Pack, index: number): PricingTier {
  // Generar tagline basado en el pack
  const taglines: Record<string, string> = {
    'Pack Básico': 'Para probar suerte',
    'Pack Popular': 'El favorito de la comunidad',
    'Pack Máximo': 'Máximas oportunidades',
  }

  // Generar CTA basado en el pack
  const ctas: Record<string, string> = {
    'Pack Básico': 'Probar ahora',
    'Pack Popular': 'Participar ahora',
    'Pack Máximo': 'Maximizar oportunidades',
  }

  // Benefits solo para el pack popular (índice 1)
  const benefits = pack.isFeatured
    ? ['Mejor precio por LuckyPass', 'Generas impacto real']
    : undefined

  const name = pack.name || 'Pack'

  return {
    id: `tier-${index}`,
    packId: pack.id,
    name: name.replace('Pack ', ''), // Quitar "Pack " para mostrar solo "Básico", "Popular", etc.
    tickets: pack.luckyPassQuantity,
    price: pack.price,
    bonusTickets: 0, // Por ahora no hay bonus
    tagline: taglines[name] || 'Participa y gana',
    cta: ctas[name] || 'Participar ahora',
    popular: pack.isFeatured,
    benefits,
  }
}

/**
 * Mapea una lista de Packs a PricingTiers
 */
export function mapPacksToPricingTiers(packs: Pack[]): PricingTier[] {
  return packs.map((pack, index) => mapPackToPricingTier(pack, index))
}
