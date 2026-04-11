import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

export interface InitiatePaymentRequest {
  purchaseId: string
}

export interface InitiatePaymentResponse {
  purchaseId: string
  flowOrderId: string
  paymentUrl: string
  token: string
}

export async function initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
  return apiClient.post<InitiatePaymentResponse>(ENDPOINTS.payments.initiate, data)
}
