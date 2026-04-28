import { getActiveRaffleProgress, getPublicRaffles } from '@/api/raffles.api'
import type { Raffle, RaffleProgress } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

type ActiveRaffleData = { raffle: Raffle | null; progress: RaffleProgress | null }

async function fetchActiveRaffle(): Promise<ActiveRaffleData> {
  const [raffles, progress] = await Promise.all([
    getPublicRaffles(),
    getActiveRaffleProgress(),
  ])
  const raffle = raffles.find(r => r.status === 'active') ?? null
  return { raffle, progress }
}

export function useActiveRaffle() {
  const { data, isLoading, error, refresh } = useAsyncData<ActiveRaffleData>(
    fetchActiveRaffle,
    { raffle: null, progress: null },
  )
  return { raffle: data.raffle, progress: data.progress, isLoading, error, refresh }
}

// New hook that returns all public raffles (active + last closed)
export function usePublicRaffles() {
  const { data, isLoading, error, refresh } = useAsyncData<Raffle[]>(
    getPublicRaffles,
    [],
  )
  return { raffles: data, isLoading, error, refresh }
}
