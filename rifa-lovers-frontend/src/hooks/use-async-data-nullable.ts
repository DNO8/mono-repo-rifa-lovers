import { useState, useEffect, useCallback } from 'react'

export interface AsyncState<T> {
  data: T
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Generic hook for async data fetching that supports nullable types.
 * Similar to useAsyncData but works with T | null types.
 *
 * @param fetcher - Async function that returns data
 * @param initialData - Initial value before first fetch completes (can be null)
 * @param deps - Extra dependencies that trigger re-fetch (default: [])
 */
export function useAsyncDataNullable<T>(
  fetcher: () => Promise<T>,
  initialData: T,
): AsyncState<T> {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    run()
  }, [run])

  return {
    data,
    isLoading,
    error,
    refresh: run,
  }
}
