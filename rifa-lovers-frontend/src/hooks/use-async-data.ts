import { useState, useEffect, useCallback, useRef } from 'react'
import { getErrorMessage } from '@/lib/errors'

export interface AsyncState<T> {
  data: T
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Generic hook for async data fetching.
 * Eliminates duplicated isLoading/error/useEffect boilerplate across feature hooks.
 *
 * @param fetcher - Async function that returns data
 * @param initialData - Initial value before first fetch completes
 * @param deps - Extra dependencies that trigger re-fetch (default: [])
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetcherRef = useRef(fetcher)

  // Keep ref in sync with latest fetcher without triggering re-renders
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const run = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-compiler/react-compiler
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, isLoading, error, refresh: run }
}
