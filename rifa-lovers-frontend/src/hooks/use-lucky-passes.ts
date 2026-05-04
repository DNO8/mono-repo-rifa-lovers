import { getMyLuckyPasses, getMyLuckyPassesSummary } from '@/api/lucky-passes.api'
import { useAuthStore } from '@/stores/auth.store'
import type { LuckyPass, LuckyPassSummary } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

type LuckyPassesData = { passes: LuckyPass[]; summary: LuckyPassSummary | null }

const INITIAL: LuckyPassesData = { passes: [], summary: null }

export function useLuckyPasses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)

  const { data, isLoading, error, refresh } = useAsyncData<LuckyPassesData>(
    async () => {
      if (!isAuthenticated) return INITIAL
      const [passes, summary] = await Promise.all([
        getMyLuckyPasses(),
        getMyLuckyPassesSummary(),
      ])
      return { passes, summary }
    },
    INITIAL,
    [isAuthenticated, userId],
  )

  return { passes: data.passes, summary: data.summary, isLoading, error, refresh }
}
