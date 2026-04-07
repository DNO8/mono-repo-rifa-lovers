import { useState, useEffect } from 'react'
import { getMyLuckyPasses, getMyLuckyPassesSummary } from '@/api/lucky-passes.api'
import type { LuckyPass, LuckyPassSummary } from '@/types/domain.types'

export function useLuckyPasses() {
  const [passes, setPasses] = useState<LuckyPass[]>([])
  const [summary, setSummary] = useState<LuckyPassSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [passesData, summaryData] = await Promise.all([
          getMyLuckyPasses(),
          getMyLuckyPassesSummary(),
        ])
        setPasses(passesData)
        setSummary(summaryData)
      } catch (err: any) {
        setError(err.message || 'Error al cargar lucky passes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { passes, summary, isLoading, error }
}
