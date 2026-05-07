import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

export interface InitiatePaymentRequest {
  purchaseId: string
  idempotencyKey?: string
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

export interface VerifyFlowStatusRequest {
  token: string
}

export interface VerifyFlowStatusResponse {
  flowStatus: number
  purchaseStatus: string
  purchaseId: string
}

export async function verifyFlowPaymentStatus(data: VerifyFlowStatusRequest): Promise<VerifyFlowStatusResponse> {
  return apiClient.post<VerifyFlowStatusResponse>(ENDPOINTS.payments.verifyFlowStatus, data)
}
