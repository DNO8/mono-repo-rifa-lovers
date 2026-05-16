import { useContext } from 'react'
import { SelectedRaffleContext } from './selected-raffle.context'

export { SelectedRaffleProvider } from './selected-raffle.provider'

export function useSelectedRaffle() {
  return useContext(SelectedRaffleContext)
}
