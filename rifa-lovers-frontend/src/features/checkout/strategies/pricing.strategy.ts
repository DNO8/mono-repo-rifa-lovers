/**
 * Pricing Strategy — Strategy pattern interface.
 * Each implementation defines how to calculate ticket pricing,
 * allowing the checkout flow to swap pricing logic at runtime.
 */

import type { PricingTier } from '@/types/domain.types'

export interface PricingResult {
  subtotal: number
  discount: number
  bonusTickets: number
  total: number
}

export interface PricingStrategy {
  calculate(tier: PricingTier, quantity: number): PricingResult
}
