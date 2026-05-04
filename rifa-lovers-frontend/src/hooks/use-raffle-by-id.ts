import { getRaffleById } from '@/api/raffles.api'
import type { Raffle } from '@/types/domain.types'
import { useAsyncDataNullable } from './use-async-data-nullable'

export function useRaffleById(raffleId: string | undefined) {
  const { data, isLoading, error, refresh } = useAsyncDataNullable<Raffle | null>(
    () => (raffleId ? getRaffleById(raffleId) : Promise.resolve(null)),
    null,
  )

  return { raffle: data, isLoading, error, refresh }
}
