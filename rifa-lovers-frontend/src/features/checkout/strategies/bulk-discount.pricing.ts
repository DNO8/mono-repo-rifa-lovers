/**
 * Bulk Discount Pricing — applies a percentage discount
 * when the quantity exceeds a configurable threshold.
 */

import type { PricingTier } from '@/types/domain.types'
import type { PricingStrategy, PricingResult } from './pricing.strategy'

export class BulkDiscountPricing implements PricingStrategy {
  constructor(
    private threshold: number = 5,
    private discountPercent: number = 10,
  ) {}

  calculate(tier: PricingTier, quantity: number): PricingResult {
    const subtotal = tier.price * quantity
    const discount = quantity >= this.threshold
      ? Math.round(subtotal * (this.discountPercent / 100))
      : 0
    return {
      subtotal,
      discount,
      bonusTickets: tier.bonusTickets * quantity,
      total: subtotal - discount,
    }
  }
}
