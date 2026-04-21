import { useEffect, useRef, useState } from 'react'
import { ENDPOINTS } from '@/api/endpoints'
import { API_BASE_URL } from '@/lib/env'

export interface RecentPurchase {
  id: string
  name: string
  action: string
  ticketCount: number
  timeAgo: string
  city: string
}

interface UseRecentPurchasesReturn {
  purchases: RecentPurchase[]
  isConnected: boolean
  error: Error | null
}

/**
 * Hook for real-time recent purchases via Server-Sent Events (SSE)
 *
 * Features:
 * - Auto-connects to SSE endpoint
 * - Updates every 30 seconds automatically
 * - Auto-reconnects on error with exponential backoff
 * - Shows connection status
 */
export function useRecentPurchases(): UseRecentPurchasesReturn {
  const [purchases, setPurchases] = useState<RecentPurchase[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)

  useEffect(() => {
    const connect = () => {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const url = `${API_BASE_URL}${ENDPOINTS.purchases.recentStream}`
      const es = new EventSource(url)

      es.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RecentPurchase[]
          setPurchases(data)
        } catch (err) {
          console.error('[useRecentPurchases] Failed to parse SSE data:', err)
        }
      }

      es.onerror = () => {
        setIsConnected(false)
        es.close()

        // Exponential backoff for reconnection
        const maxDelay = 30000 // Max 30 seconds
        const baseDelay = 1000 // Start with 1 second
        const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), maxDelay)

        reconnectAttemptsRef.current++

        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      }

      eventSourceRef.current = es
    }

    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return { purchases, isConnected, error }
}
