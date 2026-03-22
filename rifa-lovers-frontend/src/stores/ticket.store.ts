/**
 * Ticket Store — Observer pattern via Zustand.
 * Manages ticket selection state for the checkout flow.
 */

import { create } from 'zustand'
import type { TicketState } from '@/types/store.types'

export const useTicketStore = create<TicketState>()((set) => ({
  selectedTickets: new Set<string>(),
  quantity: 0,
  tierId: null,

  selectTier: (tierId: string, quantity: number) =>
    set({ tierId, quantity, selectedTickets: new Set<string>() }),

  addTicket: (ticketId: string) =>
    set((state) => {
      const next = new Set(state.selectedTickets)
      next.add(ticketId)
      return { selectedTickets: next }
    }),

  removeTicket: (ticketId: string) =>
    set((state) => {
      const next = new Set(state.selectedTickets)
      next.delete(ticketId)
      return { selectedTickets: next }
    }),

  clearSelection: () =>
    set({ selectedTickets: new Set<string>(), quantity: 0, tierId: null }),
}))
