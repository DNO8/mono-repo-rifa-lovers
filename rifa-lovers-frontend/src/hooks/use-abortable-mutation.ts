import { useRef, useEffect, useCallback } from 'react'

interface AbortableMutationOptions<TData, TError> {
  mutationFn: (signal: AbortSignal) => Promise<TData>
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
}

export function useAbortableMutation<TData, TError = unknown>(
  options: AbortableMutationOptions<TData, TError>,
) {
  const abortControllerRef = useRef<AbortController | null>(null)

  const mutate = useCallback(
    async (): Promise<TData | null> => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const data = await options.mutationFn(controller.signal)
        options.onSuccess?.(data)
        return data
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          options.onError?.(error as TError)
        }
        return null
      }
    },
    [options],
  )

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return { mutate }
}
