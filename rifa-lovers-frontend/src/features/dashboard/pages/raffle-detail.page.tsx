import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ShoppingCart, Hand, Calendar, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { TicketModelViewer } from '../components/ticket-model-viewer'

interface UserTicket {
  id: string
  number: number
  purchasedAt: string
}

const MOCK_USER_TICKETS: UserTicket[] = [
  { id: 'tk-1', number: 14582, purchasedAt: '2025-03-18' },
  { id: 'tk-2', number: 7291, purchasedAt: '2025-03-15' },
  { id: 'tk-3', number: 22045, purchasedAt: '2025-03-12' },
  { id: 'tk-4', number: 3, purchasedAt: '2025-03-10' },
  { id: 'tk-5', number: 29999, purchasedAt: '2025-03-08' },
  { id: 'tk-6', number: 501, purchasedAt: '2025-03-05' },
  { id: 'tk-7', number: 18320, purchasedAt: '2025-03-02' },
  { id: 'tk-8', number: 11111, purchasedAt: '2025-02-28' },
]

const MOCK_RAFFLE = {
  id: 'raffle-001',
  prize: 'Tesla Model 3 Long Range',
  drawDate: 'Mañana, 20:00',
  totalTickets: 30000,
}

export default function RaffleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const [selectedTicket, setSelectedTicket] = useState<UserTicket>(MOCK_USER_TICKETS[0])

  if (!user) return null

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
              {MOCK_RAFFLE.prize}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Sorteo: {MOCK_RAFFLE.drawDate}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="size-3.5" />
                {MOCK_RAFFLE.totalTickets.toLocaleString('es-CL')} tickets totales
              </span>
            </div>
          </div>

          <Link to={`/checkout?raffle=${id ?? MOCK_RAFFLE.id}&tickets=1`}>
            <Button variant="primary" size="lg">
              <ShoppingCart className="size-4" />
              Comprar otro ticket
            </Button>
          </Link>
        </div>

        {/* Main: 3D viewer + ticket list */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          {/* 3D Viewer */}
          <div className="glass-medium rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">
                Tu Ticket <span className="text-primary">#{String(selectedTicket.number).padStart(5, '0')}</span>
              </h2>
              <Badge variant="outline-primary">Rifa {id ?? MOCK_RAFFLE.id}</Badge>
            </div>

            <TicketModelViewer ticketNumber={selectedTicket.number} />

            <p className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary mt-3 opacity-60">
              <Hand className="size-3.5" />
              Arrastra para girar el ticket
            </p>
          </div>

          {/* Ticket list sidebar */}
          <div className="glass-medium rounded-2xl p-5">
            <h3 className="text-base font-bold text-text-primary mb-1">
              Mis Tickets
            </h3>
            <p className="text-xs text-text-tertiary mb-4">
              {MOCK_USER_TICKETS.length} tickets comprados
            </p>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {MOCK_USER_TICKETS.map((ticket) => {
                const isActive = ticket.id === selectedTicket.id
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border border-primary/30 shadow-sm'
                        : 'hover:bg-bg-purple-soft/50 border border-transparent'
                    }`}
                  >
                    <div>
                      <span className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-text-primary'}`}>
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
                    {isActive && (
                      <Badge variant="gradient" className="text-[10px] px-2 py-0.5">
                        Viendo
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border-light">
              <Link to={`/checkout?raffle=${id ?? MOCK_RAFFLE.id}&tickets=1`}>
                <Button variant="secondary" size="md" className="w-full">
                  <ShoppingCart className="size-4" />
                  Comprar más tickets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
