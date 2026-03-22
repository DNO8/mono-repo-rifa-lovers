/**
 * API barrel — clean public interface for the API layer.
 */

export { apiClient, ApiError } from './client'
export type { HttpClient } from './clients/http-client'
export { ENDPOINTS } from './endpoints'

export { raffleApi } from './raffle.api'
export { authApi } from './auth.api'
export { paymentApi } from './payment.api'
