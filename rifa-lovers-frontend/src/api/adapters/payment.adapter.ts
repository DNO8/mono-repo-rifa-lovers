/**
 * Payment Adapter — transforms raw payment API responses into domain types.
 */

import type { PaymentIntentApiResponse } from '@/types/api.types'

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed'
}

export function toPaymentIntent(raw: PaymentIntentApiResponse): PaymentIntent {
  return {
    id: raw.id,
    clientSecret: raw.client_secret,
    amount: raw.amount,
    currency: raw.currency,
    status: raw.status,
  }
}
