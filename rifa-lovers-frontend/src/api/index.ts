/**
 * API barrel — clean public interface for the API layer.
 */

export { apiClient, ApiError } from './client'
export type { HttpClient } from './clients/http-client'
export { ENDPOINTS } from './endpoints'

export { getActiveRaffle, getActiveRaffleProgress } from './raffles.api'
export { getMyLuckyPasses, getMyLuckyPassesSummary } from './lucky-passes.api'
export { getMyPurchases } from './purchases.api'
