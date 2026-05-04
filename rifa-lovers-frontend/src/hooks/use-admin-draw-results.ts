import { useCallback } from 'react'
import { getAdminDrawResults, type AdminDrawResults } from '@/api/draw.api'
import { useAsyncDataNullable } from './use-async-data-nullable'

export function useAdminDrawResults(raffleId: string | undefined) {
  const fetcher = useCallback(
    () => (raffleId ? getAdminDrawResults(raffleId) : Promise.resolve(null)),
    [raffleId],
  )

  const { data, isLoading, error, refresh } = useAsyncDataNullable<AdminDrawResults | null>(
    fetcher,
    null,
  )

  return {
    results: data,
    isLoading,
    error,
    refresh,
  }
}
