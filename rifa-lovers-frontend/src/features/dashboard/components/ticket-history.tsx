import { Gift, ChevronRight, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface HistoryItem {
  id: string
  name: string
  status: 'finalizado' | 'activo' | 'bloqueado'
  tickets: number
}

interface TicketHistoryProps {
  items: HistoryItem[]
}

export function TicketHistory({ items }: TicketHistoryProps) {
  return (
    <div className="glass-medium rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-text-primary">Historial</h2>
        <Badge variant="subtle" className="cursor-pointer text-xs px-3 py-1">
          Ver todos
        </Badge>
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const isLocked = item.status === 'bloqueado'
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-bg-purple-soft/50 cursor-pointer"
            >
              <div className="size-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                <Gift className="size-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-tertiary">
                  Finalizado &bull; {item.tickets} {item.tickets === 1 ? 'ticket' : 'tickets'}
                </p>
              </div>

              <div className="shrink-0 text-text-tertiary">
                {isLocked ? (
                  <Lock className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
