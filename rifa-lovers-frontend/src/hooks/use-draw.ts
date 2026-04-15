import { getDrawResults, type DrawResults } from '@/api/draw.api'
import { ApiError } from '@/api/client'
import { useAsyncData } from './use-async-data'

type DrawResultsData = { results: DrawResults | null; hasDrawn: boolean }

const INITIAL: DrawResultsData = { results: null, hasDrawn: false }

async function fetchDrawResults(raffleId: string): Promise<DrawResultsData> {
  try {
    const data = await getDrawResults(raffleId)
    if (data && 'winners' in data) {
      return { results: data, hasDrawn: true }
    }
    return INITIAL
  } catch (err: unknown) {
    const is404 = err instanceof ApiError && err.status === 404
    const isNotExecuted = err instanceof Error && err.message.includes('no se ha ejecutado')
    if (is404 || isNotExecuted) return INITIAL
    throw err
  }
}

export function useDrawResults(raffleId: string | undefined) {
  const { data, isLoading, error } = useAsyncData<DrawResultsData>(
    () => raffleId ? fetchDrawResults(raffleId) : Promise.resolve(INITIAL),
    INITIAL,
    [raffleId],
  )

  return { results: data.results, hasDrawn: data.hasDrawn, isLoading, error }
}
