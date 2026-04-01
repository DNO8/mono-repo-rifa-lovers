import { useAuthStore } from '@/stores/auth.store'
import { DashboardGreetingSection } from '../sections/dashboard-greeting-section'
import { DashboardImpactSection } from '../sections/dashboard-impact-section'
import type { CollectiveImpact } from '../sections/dashboard-impact-section'
import { RaffleHeroCard } from '../components/raffle-hero-card'
import type { RaffleCardData } from '../components/raffle-hero-card'
import { TicketHistory } from '../components/ticket-history'
import type { HistoryItem } from '../components/ticket-history'
import { SocialImpactBanner } from '../components/social-impact-banner'

const MOCK_HISTORY: HistoryItem[] = [
  { id: 'h1', name: 'Rifa iPhone 15 Pro', status: 'finalizado', tickets: 2 },
  { id: 'h2', name: 'Viaje a Cancún', status: 'finalizado', tickets: 5 },
  { id: 'h3', name: 'MacBook Air M3', status: 'bloqueado', tickets: 1 },
]

const MOCK_RAFFLE: RaffleCardData = {
  id: 'raffle-001',
  prize: 'MacBook Air M5',
  ticketCount: 8,
  uniqueId: 'RL-9921',
  drawLabel: 'Mañana, 20:00',
  drawTime: '20:00',
  drawDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

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

const MOCK_TOTAL_TICKETS = 12
const MOCK_POINTS = 450

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Greeting */}
        <DashboardGreetingSection
          user={user}
          totalTickets={MOCK_TOTAL_TICKETS}
          points={MOCK_POINTS}
        />

        {/* Main layout: sidebar left + main right */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="order-2 lg:order-1 space-y-5">
            <TicketHistory items={MOCK_HISTORY} />
            <SocialImpactBanner />
          </aside>

          {/* Main content */}
          <main className="order-1 lg:order-2 space-y-6">
            <RaffleHeroCard raffle={MOCK_RAFFLE} />
            <DashboardImpactSection impact={MOCK_IMPACT} />
          </main>
        </div>
      </div>
    </div>
  )
}
