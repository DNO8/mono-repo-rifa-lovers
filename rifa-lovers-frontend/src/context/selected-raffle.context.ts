import { createContext } from 'react'
import type { Raffle, RaffleProgress, Pack } from '@/types/domain.types'

export interface SelectedRaffleContextValue {
  selectedRaffleId: string | null
  setSelectedRaffleId: (id: string | null) => void
  raffle: Raffle | null
  progress: RaffleProgress | null
  packs: Pack[]
  isLoading: boolean
  error: string | null
  allRaffles: Raffle[]
}

export const SelectedRaffleContext = createContext<SelectedRaffleContextValue>({
  selectedRaffleId: null,
  setSelectedRaffleId: () => {},
  raffle: null,
  progress: null,
  packs: [],
  isLoading: false,
  error: null,
  allRaffles: [],
})
