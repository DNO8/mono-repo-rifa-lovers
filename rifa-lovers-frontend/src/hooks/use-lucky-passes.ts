import { useState, useEffect } from 'react'
import { getMyLuckyPasses, getMyLuckyPassesSummary } from '@/api/lucky-passes.api'
import { useAuthStore } from '@/stores/auth.store'
import type { LuckyPass, LuckyPassSummary } from '@/types/domain.types'

export function useLuckyPasses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [passes, setPasses] = useState<LuckyPass[]>([])
  const [summary, setSummary] = useState<LuckyPassSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [passesData, summaryData] = await Promise.all([
          getMyLuckyPasses(),
          getMyLuckyPassesSummary(),
        ])
        setPasses(passesData)
        setSummary(summaryData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar lucky passes'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  return { passes, summary, isLoading, error }
}
