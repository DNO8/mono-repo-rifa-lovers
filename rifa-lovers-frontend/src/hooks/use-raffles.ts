import { getActiveRaffle, getActiveRaffleProgress } from '@/api/raffles.api'
import type { Raffle, RaffleProgress } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

type ActiveRaffleData = { raffle: Raffle | null; progress: RaffleProgress | null }

async function fetchActiveRaffle(): Promise<ActiveRaffleData> {
  const [raffle, progress] = await Promise.all([
    getActiveRaffle(),
    getActiveRaffleProgress(),
  ])
  return { raffle, progress }
}

export function useActiveRaffle() {
  const { data, isLoading, error } = useAsyncData<ActiveRaffleData>(
    fetchActiveRaffle,
    { raffle: null, progress: null },
  )
  return { raffle: data.raffle, progress: data.progress, isLoading, error }
}
