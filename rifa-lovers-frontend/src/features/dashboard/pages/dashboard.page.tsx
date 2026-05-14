import { useShallow } from 'zustand/react/shallow'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
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
import { LogOut, LayoutDashboard, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePurchases } from '@/hooks/use-purchases'
import { useLuckyPasses } from '@/hooks/use-lucky-passes'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { useUserRaffles } from '@/hooks/use-user-raffles'
import { Spinner } from '@/components/ui/spinner'
import { NewsletterDashboardCard } from '../components/newsletter-dashboard-card'
import { getPublicRaffles } from '@/api/raffles.api'
import { retryPayment } from '@/api/purchases.api'
import type { Raffle, RaffleProgress, Purchase } from '@/types/domain.types'
import { useAsyncData } from '@/hooks/use-async-data'
import { toast } from 'react-toastify'

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

// Transform purchases to history items — include ALL statuses, individual purchases
const transformPurchasesToHistory = (purchases: Purchase[], onRetry?: (id: string) => void): HistoryItem[] => {
  return purchases.map((p) => ({
    id: p.id,
    name: p.raffleName || 'Rifa sin nombre',
    status: mapStatus(p.status),
    tickets: p.luckyPassCount || 0,
    amount: p.totalAmount,
    purchaseId: p.id,
    onRetry,
  }))
}

// Helper to transform raffle to card data
const transformRaffleToCardData = (raffle: Raffle | null, userLuckyPassTotal: number): RaffleCardData | null => {
  if (!raffle) return null

  const closedStatuses = ['sold_out', 'closed', 'drawn']
  const isClosed = closedStatuses.includes(raffle.status)

  let drawLabel: string
  let drawTime: string
  let drawDate: string

  if (isClosed) {
    drawLabel = 'Rifa Cerrada'
    drawTime = ''
    drawDate = raffle.endDate ?? new Date().toISOString()
  } else if (raffle.endDate) {
    const end = new Date(raffle.endDate)
    drawDate = end.toISOString()
    drawLabel = 'Próximo sorteo'
    drawTime = end.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
  } else {
    drawLabel = 'Próximamente'
    drawTime = ''
    drawDate = new Date().toISOString()
  }

  return {
    id: raffle.id,
    prize: raffle.title || 'Premio por confirmar',
    ticketCount: userLuckyPassTotal,
    uniqueId: `RL-${raffle.id.slice(-4).toUpperCase()}`,
    drawLabel,
    drawTime,
    drawDate,
  }
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore(
    useShallow((s) => ({ user: s.user, logout: s.logout }))
  )
  const navigate = useNavigate()

  const { purchases, isLoading: isLoadingPurchases } = usePurchases()
  const { passes, summary: luckyPassSummary, isLoading: isLoadingPasses } = useLuckyPasses()
  const { raffle, progress, isLoading: isLoadingRaffle } = useActiveRaffle()
  const { raffles: userRaffles, isLoading: isLoadingUserRaffles } = useUserRaffles()

  // Fetch public raffles for all users to see active ones
  const { data: publicRaffles, isLoading: isLoadingPublicRaffles } = useAsyncData<Raffle[]>(
    async () => {
      const result = await getPublicRaffles()
      return result.filter((r) => r.status === 'active')
    },
    [],
  )

  const isOperatorOrAdmin = user?.role === 'operator' || user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleRetry = async (purchaseId: string) => {
    try {
      const result = await retryPayment(purchaseId)
      toast.success('Redirigiendo a Flow para completar el pago...')
       
      window.location.assign(result.paymentUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al reintentar el pago'
      toast.error(msg)
    }
  }

  if (!user) return null

  const isLoading = isLoadingPurchases || isLoadingPasses || isLoadingRaffle || isLoadingUserRaffles || isLoadingPublicRaffles
  const totalTickets = luckyPassSummary?.totalPasses || 0
  const points = totalTickets // Puntos = misma cantidad de LuckyPasses totales

  const historyItems = transformPurchasesToHistory(purchases, handleRetry)

  return (
    <>
      <SEOHead title="Dashboard" noindex />
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Mi Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            {isOperatorOrAdmin && (
              <Button
                variant="outline-primary"
                size="sm"
                className="shrink-0"
                onClick={() => navigate('/operator')}
              >
                <LayoutDashboard className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Panel Operador</span>
              </Button>
            )}
            <Button
              variant="outline-primary"
              size="sm"
              className="shrink-0"
              onClick={() => navigate('/perfil')}
            >
              <UserCog className="size-4 mr-1.5 sm:mr-0" />
              <span className="hidden sm:inline ml-1.5">Perfil</span>
            </Button>
            <Button variant="outline-primary" size="sm" className="shrink-0" onClick={handleLogout}>
              <LogOut className="size-4 mr-1.5 sm:mr-0" />
              <span className="hidden sm:inline ml-1.5">Cerrar sesión</span>
            </Button>
          </div>
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
                <SocialImpactBanner paidCount={purchases.filter(p => p.status === 'paid').length} />
                {user?.email && (
                  <NewsletterDashboardCard
                    email={user.email}
                    name={user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined}
                  />
                )}
              </aside>

              {/* Main content */}
              <main className="order-1 lg:order-2 space-y-6">
                {/* User raffles with LuckyPasses */}
                {userRaffles.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-text-primary">Mis Rifas</h2>
                    <div className="space-y-4">
                      {userRaffles.map((userRaffle) => {
                        const raffleTickets = passes.filter(
                          (p) => p.raffleId === userRaffle.id && p.status !== 'cancelled'
                        ).length
                        const cardData = transformRaffleToCardData(userRaffle, raffleTickets)
                        return (
                          cardData && <RaffleHeroCard key={userRaffle.id} raffle={cardData} />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Public active raffles — visible to everyone */}
                {publicRaffles && publicRaffles.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-text-primary">Rifas Disponibles</h2>
                    <div className="space-y-4">
                      {publicRaffles.map((pubRaffle) => {
                        const raffleTickets = passes.filter(
                          (p) => p.raffleId === pubRaffle.id && p.status !== 'cancelled'
                        ).length
                        const cardData = transformRaffleToCardData(pubRaffle, raffleTickets)
                        const alreadyOwned = userRaffles.some((ur) => ur.id === pubRaffle.id)
                        if (!cardData || alreadyOwned) return null
                        return (
                          <div key={pubRaffle.id} className="relative">
                            <RaffleHeroCard raffle={cardData} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* Show impact section only for active raffle */}
                {raffle && raffle.status === 'active' && (
                  <DashboardImpactSection impact={buildImpact(raffle, progress)} />
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}
