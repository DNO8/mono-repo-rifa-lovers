/**
 * Raw API response types — mirror the backend DTOs exactly.
 * Adapters (src/api/adapters/) transform these into domain types.
 */

export interface RaffleApiResponse {
  id: string
  name: string
  description: string
  prize: string
  prize_image: string
  ticket_price: number
  total_tickets: number
  sold_count: number
  progress: number
  draw_date: string
  is_active: boolean
}

export interface UserApiResponse {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface AuthApiResponse {
  user: UserApiResponse
  token: string
}

export interface OrderApiResponse {
  id: string
  raffle_id: string
  raffle_name: string
  ticket_count: number
  bonus_tickets: number
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

export interface DashboardSummaryApiResponse {
  total_tickets: number
  points: number
  active_raffle: RaffleApiResponse | null
  history: OrderApiResponse[]
}

export interface PaymentIntentApiResponse {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed'
}

export interface ContactApiPayload {
  name: string
  email: string
  message: string
}

export interface CheckoutApiPayload {
  raffle_id: string
  ticket_count: number
}

export interface ApiErrorResponse {
  message: string
  code?: string
  details?: Record<string, string[]>
}
