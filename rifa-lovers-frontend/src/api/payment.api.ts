/**
 * Payment API Facade — single entry point for checkout/payment API calls.
 */

import { ENDPOINTS } from './endpoints'
import { apiClient } from './client'
import { toPaymentIntent } from './adapters/payment.adapter'
import type { PaymentIntent } from './adapters/payment.adapter'
import type { PaymentIntentApiResponse, CheckoutApiPayload } from '@/types/api.types'

export const paymentApi = {
  async createOrder(raffleId: string, ticketCount: number): Promise<PaymentIntent> {
    const payload: CheckoutApiPayload = {
      raffle_id: raffleId,
      ticket_count: ticketCount,
    }
    const raw = await apiClient.post<PaymentIntentApiResponse>(ENDPOINTS.checkout.createOrder, payload)
    return toPaymentIntent(raw)
  },
}
