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

const MOCK_IMPACT: CollectiveImpact = {
  progress: 24,
  nextGoal: '💸 Respiro RifaLovers',
  remaining: 3800,
  milestones: [
    { label: '🛒 Carrito Lleno', status: 'done', icon: 'check' },
    { label: '💸 Respiro RifaLovers', status: 'active', icon: 'circle' },
    { label: '🌊 Escapada RifaLovers', status: 'pending', icon: 'home' },
    { label: '💸 Respiro (reimpulso)', status: 'pending', icon: 'home' },
    { label: '🔓 Gran Desbloqueo', status: 'pending', icon: 'home' },
  ],
}

// Helper to map purchase status to display status
const mapStatus = (status: string): 'finalizado' | 'activo' | 'bloqueado' => {
  switch (status) {
    case 'paid':
      return 'finalizado'
    case 'pending':
      return 'activo'
    default:
      return 'bloqueado'
  }
}

// Helper to transform purchases to history items
const transformPurchasesToHistory = (purchases: any[]): HistoryItem[] => {
  return purchases.map((p) => ({
    id: p.id,
    name: p.raffleName,
    status: mapStatus(p.status),
    tickets: 1, // Each purchase = 1 pack for now
  }))
}

// Helper to transform raffle to card data
const transformRaffleToCardData = (raffle: any, progress: any): RaffleCardData | null => {
  if (!raffle) return null
  return {
    id: raffle.id,
    prize: raffle.title || 'Premio por confirmar',
    ticketCount: progress?.packsSold || 0,
    uniqueId: `RL-${raffle.id.slice(-4).toUpperCase()}`,
    drawLabel: 'Próximo sorteo',
    drawTime: '20:00',
    drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
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
  const totalTickets = luckyPassSummary?.total || 0
  const points = (luckyPassSummary?.active || 0) * 10 // 10 points per active ticket

  const historyItems = transformPurchasesToHistory(purchases)
  const raffleCardData = transformRaffleToCardData(raffle, progress)

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
                <DashboardImpactSection impact={MOCK_IMPACT} />
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
