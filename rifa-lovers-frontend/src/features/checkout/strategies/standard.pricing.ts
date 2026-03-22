/**
 * Standard Pricing — default strategy with no discounts.
 * Price = tier.price × quantity, bonus = tier.bonusTickets × quantity.
 */

import type { PricingTier } from '@/types/domain.types'
import type { PricingStrategy, PricingResult } from './pricing.strategy'

export class StandardPricing implements PricingStrategy {
  calculate(tier: PricingTier, quantity: number): PricingResult {
    const subtotal = tier.price * quantity
    return {
      subtotal,
      discount: 0,
      bonusTickets: tier.bonusTickets * quantity,
      total: subtotal,
    }
  }
}
