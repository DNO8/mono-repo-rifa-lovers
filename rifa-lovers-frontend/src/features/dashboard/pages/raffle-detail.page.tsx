import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ShoppingCart, Hand, Calendar, Hash, Trophy, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { TicketModelViewer } from '../components/ticket-model-viewer'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { useLuckyPasses } from '@/hooks/use-lucky-passes'
import { Spinner } from '@/components/ui/spinner'
import { TestimonialForm } from '../components/testimonial-form'

interface UserTicket {
  id: string
  number: number
  purchasedAt: string
  isWinner: boolean
}

export default function RaffleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const { raffle, isLoading: isLoadingRaffle } = useActiveRaffle()
  const { passes, isLoading: isLoadingPasses } = useLuckyPasses()
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null)

  if (!user) return null

  const isLoading = isLoadingRaffle || isLoadingPasses

  const userTickets: UserTicket[] = passes.map((lp) => ({
    id: lp.id,
    number: lp.ticketNumber,
    purchasedAt: lp.createdAt,
    isWinner: lp.isWinner,
  }))

  const activeTicket = selectedTicket ?? userTickets[0] ?? null
  const raffleId = id ?? raffle?.id
  const raffleTitle = raffle?.title ?? 'Premio por confirmar'
  const maxTicketNumber = raffle?.maxTicketNumber ?? 30000

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Volver al Dashboard
        </Link>

        {/* Raffle info header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <Badge variant="gradient" className="mb-3">Premium Entry</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              LuckyPass {raffleTitle}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Sorteo: Próximamente
              </span>
              <span className="flex items-center gap-1">
                <Hash className="size-3.5" />
                {maxTicketNumber.toLocaleString('es-CL')} números disponibles
              </span>
            </div>
          </div>

          <Link to={`/checkout?raffle=${raffleId}&tickets=1`}>
            <Button variant="primary" size="lg">
              <ShoppingCart className="size-4" />
              Activar otro LuckyPass
            </Button>
          </Link>
        </div>

        {/* Main: 3D viewer + ticket list */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          {/* 3D Viewer */}
          <div className="glass-medium rounded-2xl p-6 overflow-hidden">
            {activeTicket ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary">
                    Tu LuckyPass <span className="text-primary">#{String(activeTicket.number).padStart(5, '0')}</span>
                  </h2>
                  <Badge variant="outline-primary">Rifa {raffleId}</Badge>
                </div>

                <TicketModelViewer ticketNumber={activeTicket.number} />

                <p className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary mt-3 opacity-60">
                  <Hand className="size-3.5" />
                  Arrastra para girar tu LuckyPass
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-text-secondary mb-4">Aún no tienes LuckyPass para esta rifa</p>
                <Link to={`/checkout?raffle=${raffleId}&tickets=1`}>
                  <Button variant="primary" size="lg">
                    <ShoppingCart className="size-4" />
                    Activar tu primer LuckyPass
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Ticket list sidebar */}
          <div className="glass-medium rounded-2xl p-5">
            <h3 className="text-base font-bold text-text-primary mb-1">
              Mis LuckyPass
            </h3>
            <p className="text-xs text-text-tertiary mb-4">
              {userTickets.length} LuckyPass activados
            </p>

            {userTickets.length > 0 ? (
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {userTickets.map((ticket) => {
                  const isActive = ticket.id === activeTicket?.id
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                        ticket.isWinner
                          ? 'bg-yellow-50 border border-yellow-300 shadow-md ring-1 ring-yellow-200'
                          : isActive
                            ? 'bg-primary/10 border border-primary/30 shadow-sm'
                            : 'hover:bg-bg-purple-soft/50 border border-transparent'
                      }`}
                    >
                      <div>
                        <span className={`text-sm font-bold flex items-center gap-1.5 ${ticket.isWinner ? 'text-yellow-600' : isActive ? 'text-primary' : 'text-text-primary'}`}>
                          {ticket.isWinner && <Trophy className="size-3.5 text-yellow-500" />}
                          #{String(ticket.number).padStart(5, '0')}
                        </span>
                        <span className="block text-[10px] text-text-tertiary mt-0.5">
                          {new Date(ticket.purchasedAt).toLocaleDateString('es-CL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {ticket.isWinner ? (
                        <Badge variant="success" className="text-[10px] px-2 py-0.5 animate-pulse">
                          🏆 Ganador
                        </Badge>
                      ) : isActive ? (
                        <Badge variant="gradient" className="text-[10px] px-2 py-0.5">
                          Viendo
                        </Badge>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary text-center py-8">
                Sin LuckyPass aún
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-border-light">
              <Link to={`/checkout?raffle=${raffleId}&tickets=1`}>
                <Button variant="secondary" size="md" className="w-full">
                  <ShoppingCart className="size-4" />
                  Activar más LuckyPass
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Winner section: shown when selected ticket is a winner */}
        {activeTicket?.isWinner && raffleId && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-yellow-200 bg-yellow-50/60">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-yellow-200 bg-yellow-50">
              <div className="size-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Trophy className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-bold text-yellow-800 text-lg leading-tight">¡Felicitaciones, ganaste!</p>
                <p className="text-xs text-yellow-600 mt-0.5">Tu LuckyPass #{String(activeTicket.number).padStart(5, '0')} fue seleccionado en el sorteo</p>
              </div>
            </div>

            {/* Testimonial form */}
            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-1.5">
                <Star className="size-4 text-yellow-500" />
                Comparte tu experiencia
              </p>
              <p className="text-xs text-yellow-700/70 mb-4">Tu testimonio puede aparecer en la página principal e inspirar a otros participantes.</p>
              <TestimonialForm raffleId={raffleId} luckyPassId={activeTicket.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
