import { Ticket, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types/domain.types'

interface DashboardGreetingSectionProps {
  user: User
  totalTickets: number
  points: number
}

export function DashboardGreetingSection({ user, totalTickets, points }: DashboardGreetingSectionProps) {
  return (
    <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          Hola, {user.firstName || 'Usuario'} <span className="inline-block">👋</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Aquí tienes un resumen de tus oportunidades hoy.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="outline-primary" className="gap-1.5 px-3 py-1.5">
          <Ticket className="size-3.5" />
          {totalTickets} LuckyPass
        </Badge>
        <Badge variant="subtle" className="gap-1.5 px-3 py-1.5">
          <Star className="size-3.5" />
          {points.toLocaleString('es-CL')} Puntos
        </Badge>
      </div>
    </section>
  )
}
