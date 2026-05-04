import { useCallback } from 'react'
import { getRaffleById } from '@/api/raffles.api'
import type { Raffle } from '@/types/domain.types'
import { useAsyncDataNullable } from './use-async-data-nullable'

export function useRaffleById(raffleId: string | undefined) {
  const fetcher = useCallback(
    () => (raffleId ? getRaffleById(raffleId) : Promise.resolve(null)),
    [raffleId],
  )

  const { data, isLoading, error, refresh } = useAsyncDataNullable<Raffle | null>(
    fetcher,
    null,
  )

  return { raffle: data, isLoading, error, refresh }
}
