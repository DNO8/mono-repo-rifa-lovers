import type { Pack, PricingTier } from '@/types/domain.types'
import { PACK_UI_META, DEFAULT_PACK_UI_META } from '@/lib/constants'

/**
 * Mapea un Pack del backend a un PricingTier para la UI.
 * Los datos reales (id, price, luckyPassQuantity) vienen del API.
 * La metadata de UI (tagline, cta, benefits) viene de PACK_UI_META.
 */
export function mapPackToPricingTier(pack: Pack, index: number): PricingTier {
  const name = pack.name || 'Pack'
  const meta = PACK_UI_META[name] || DEFAULT_PACK_UI_META

  return {
    id: `tier-${index}`,
    packId: pack.id,
    name: name.replace('Pack ', ''),
    tickets: pack.luckyPassQuantity,
    price: pack.price,
    bonusTickets: 0,
    tagline: meta.tagline,
    cta: meta.cta,
    popular: pack.isFeatured,
    benefits: meta.benefits,
  }
}

/**
 * Mapea packs del API a PricingTiers.
 * Muestra todos los packs de la rifa seleccionada, ordenados por precio.
 */
export function mapPacksToPricingTiers(packs: Pack[]): PricingTier[] {
  return packs
    .sort((a, b) => a.price - b.price)
    .map((pack, index) => mapPackToPricingTier(pack, index))
}
