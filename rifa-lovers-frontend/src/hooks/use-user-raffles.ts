import { getUserRaffles } from '@/api/raffles.api'
import type { Raffle } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

export function useUserRaffles() {
  const { data, isLoading, error, refresh } = useAsyncData<Raffle[]>(
    getUserRaffles,
    [],
  )
  return { raffles: data, isLoading, error, refresh }
}
