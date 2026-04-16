import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/stores/auth.store'
import { DashboardGreetingSection } from '../sections/dashboard-greeting-section'
import { DashboardImpactSection } from '../sections/dashboard-impact-section'
import type { CollectiveImpact } from '../sections/dashboard-impact-section'
import { RaffleHeroCard } from '../components/raffle-hero-card'
import type { RaffleCardData } from '../components/raffle-hero-card'
import { TicketHistory } from '../components/ticket-history'
import type { HistoryItem } from '../components/ticket-history'
import { SocialImpactBanner } from '../components/social-impact-banner'
import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePurchases } from '@/hooks/use-purchases'
import { useLuckyPasses } from '@/hooks/use-lucky-passes'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { Spinner } from '@/components/ui/spinner'
import type { Raffle, RaffleProgress, Purchase } from '@/types/domain.types'

function buildImpact(raffle: Raffle | null, progress: RaffleProgress | null): CollectiveImpact {
  const milestones = raffle?.milestones ?? []
  const sorted = [...milestones].sort((a, b) => a.sortOrder - b.sortOrder)
  const packsSold = progress?.packsSold ?? 0
  const goalPacks = raffle?.goalPacks ?? 1

  // Dynamic progress: packsSold / goalPacks * 100
  const pct = Math.min((packsSold / goalPacks) * 100, 100)

  const firstPendingIdx = sorted.findIndex((m) => !m.isUnlocked)
  const nextMilestone = firstPendingIdx >= 0 ? sorted[firstPendingIdx] : null

  return {
    progress: Math.round(pct * 100) / 100,
    nextGoal: nextMilestone?.name ?? 'Meta completada',
    remaining: nextMilestone ? Math.max(0, nextMilestone.requiredPacks - packsSold) : 0,
    milestones: sorted.map((m, i) => {
      const isUnlocked = m.isUnlocked
      const isActive = !isUnlocked && i === firstPendingIdx
      return {
        id: m.id,
        label: m.name ?? `Hito ${m.sortOrder}`,
        status: isUnlocked ? 'done' as const : isActive ? 'active' as const : 'pending' as const,
        icon: isUnlocked ? 'check' as const : isActive ? 'circle' as const : 'home' as const,
      }
    }),
  }
}

// Helper to map purchase status to display status
const mapStatus = (status: string): 'confirmado' | 'pendiente' | 'fallido' => {
  switch (status) {
    case 'paid':
      return 'confirmado'
    case 'pending':
      return 'pendiente'
    default:
      return 'fallido'
  }
}

// Helper to transform purchases to history items — group by raffleId
const transformPurchasesToHistory = (purchases: Purchase[]): HistoryItem[] => {
  const grouped = new Map<string, HistoryItem>()
  for (const p of purchases) {
    if (p.status !== 'paid') continue
    const lpCount = p.luckyPassCount ?? 1
    const existing = grouped.get(p.raffleId)
    if (existing) {
      existing.tickets += lpCount
      // Escalate status: confirmado > pendiente
      if (p.status === 'paid') existing.status = 'confirmado'
    } else {
      grouped.set(p.raffleId, {
        id: p.raffleId,
        name: p.raffleName,
        status: mapStatus(p.status),
        tickets: lpCount,
      })
    }
  }
  return Array.from(grouped.values())
}

// Helper to transform raffle to card data
const transformRaffleToCardData = (raffle: Raffle | null, userLuckyPassTotal: number): RaffleCardData | null => {
  if (!raffle) return null
  return {
    id: raffle.id,
    prize: raffle.title || 'Premio por confirmar',
    ticketCount: userLuckyPassTotal,
    uniqueId: `RL-${raffle.id.slice(-4).toUpperCase()}`,
    drawLabel: 'Próximo sorteo',
    drawTime: '20:00',
    drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore(
    useShallow((s) => ({ user: s.user, logout: s.logout }))
  )
  const navigate = useNavigate()

  const { purchases, isLoading: isLoadingPurchases } = usePurchases()
  const { summary: luckyPassSummary, isLoading: isLoadingPasses } = useLuckyPasses()
  const { raffle, progress, isLoading: isLoadingRaffle } = useActiveRaffle()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  const isLoading = isLoadingPurchases || isLoadingPasses || isLoadingRaffle
  const totalTickets = luckyPassSummary?.active || 0
  const points = (luckyPassSummary?.active || 0) * 10 // 10 points per active ticket

  const historyItems = transformPurchasesToHistory(purchases)
  const raffleCardData = transformRaffleToCardData(raffle, totalTickets)

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Header con logout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Mi Dashboard</h1>
          <Button variant="outline-primary" size="sm" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        {/* Greeting */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DashboardGreetingSection
              user={user}
              totalTickets={totalTickets}
              points={points}
            />

            {/* Main layout: sidebar left + main right */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
              {/* Sidebar */}
              <aside className="order-2 lg:order-1 space-y-5">
                <TicketHistory items={historyItems.length > 0 ? historyItems : []} />
                <SocialImpactBanner />
              </aside>

              {/* Main content */}
              <main className="order-1 lg:order-2 space-y-6">
                {raffleCardData && <RaffleHeroCard raffle={raffleCardData} />}
                <DashboardImpactSection impact={buildImpact(raffle, progress)} />
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
