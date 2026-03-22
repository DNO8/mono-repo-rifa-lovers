/**
 * UI Store — Observer pattern via Zustand.
 * Manages global UI state: modals, sidebar, loading overlays.
 */

import { create } from 'zustand'
import type { UiState } from '@/types/store.types'

export const useUiStore = create<UiState>()((set) => ({
  isSidebarOpen: false,
  isModalOpen: false,
  modalContent: null,
  globalLoading: false,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openModal: (content: string) =>
    set({ isModalOpen: true, modalContent: content }),

  closeModal: () =>
    set({ isModalOpen: false, modalContent: null }),

  setGlobalLoading: (loading: boolean) =>
    set({ globalLoading: loading }),
}))
