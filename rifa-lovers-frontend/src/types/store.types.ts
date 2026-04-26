/**
 * Store state interfaces — contracts for Zustand stores (Observer pattern).
 */

import type { User } from './domain.types'

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, lastName: string, phone: string, email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string) => void
  clearError: () => void
}

export interface TicketState {
  selectedTickets: Set<string>
  quantity: number
  tierId: string | null
  selectTier: (tierId: string, quantity: number) => void
  addTicket: (ticketId: string) => void
  removeTicket: (ticketId: string) => void
  clearSelection: () => void
}

