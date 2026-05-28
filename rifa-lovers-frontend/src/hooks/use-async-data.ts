import { useState, useEffect, useCallback, useRef } from 'react'
import { getErrorMessage } from '@/lib/errors'
import { getCacheItem, setCacheItem } from '@/lib/cache/local-storage-cache'

export interface AsyncState<T> {
  data: T
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Generic hook for async data fetching with optional stale-while-revalidate caching.
 * Eliminates duplicated isLoading/error/useEffect boilerplate across feature hooks.
 *
 * @param fetcher - Async function that returns data
 * @param initialData - Initial value before first fetch completes
 * @param deps - Extra dependencies that trigger re-fetch (default: [])
 * @param cacheKey - Optional localStorage cache key for stale-while-revalidate caching
 * @param cacheTtlMs - Cache time-to-live in milliseconds (default: 5 minutes)
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  deps: unknown[] = [],
  cacheKey?: string,
  cacheTtlMs = 5 * 60 * 1000,
): AsyncState<T> {
  const cached = cacheKey ? getCacheItem<T>(cacheKey) : null
  const [data, setData] = useState<T>(cached ?? initialData)
  const [isLoading, setIsLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  const fetcherRef = useRef(fetcher)

  // Keep ref in sync with latest fetcher without triggering re-renders
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const run = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
      if (cacheKey) setCacheItem(cacheKey, result, cacheTtlMs)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      if (!options?.silent) setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-compiler/react-compiler
  }, deps)

  useEffect(() => {
    // If we have cached data, revalidate silently in background
    if (cached) {
      run({ silent: true })
    } else {
      run()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  return { data, isLoading, error, refresh: () => run() }
}
