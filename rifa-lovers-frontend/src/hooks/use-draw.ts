import { useState, useEffect } from 'react'
import { getDrawResults, type DrawResults, type DrawCheckResponse } from '@/api/draw.api'

export function useDrawResults(raffleId: string | undefined) {
  const [results, setResults] = useState<DrawResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (!raffleId) {
      setIsLoading(false)
      return
    }

    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const data = await getDrawResults(raffleId)
        
        if (data && 'winners' in data) {
          setResults(data)
          setHasDrawn(true)
        } else {
          setHasDrawn(false)
        }
      } catch (err: any) {
        if (err.message?.includes('no se ha ejecutado') || err.status === 404) {
          setHasDrawn(false)
        } else {
          setError(err.message || 'Error al cargar resultados')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [raffleId])

  return { results, isLoading, error, hasDrawn }
}
