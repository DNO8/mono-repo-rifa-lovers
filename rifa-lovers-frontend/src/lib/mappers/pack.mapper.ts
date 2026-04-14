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
 * Mapea packs del API a PricingTiers, excluyendo el pack Emprendedor Legend.
 * Solo muestra los 3 packs más baratos en las cards del landing.
 */
export function mapPacksToPricingTiers(packs: Pack[]): PricingTier[] {
  return packs
    .filter((p) => !p.name?.toUpperCase().includes('EMPRENDEDOR'))
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
    .map((pack, index) => mapPackToPricingTier(pack, index))
}
