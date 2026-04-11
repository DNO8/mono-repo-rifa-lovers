import { useState, useEffect } from 'react'
import { getPacks } from '@/api/packs.api'
import type { Pack } from '@/types/domain.types'

export function usePacks() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const packsData = await getPacks()
        setPacks(packsData)
      } catch (err: any) {
        setError(err.message || 'Error al cargar packs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { packs, isLoading, error }
}
