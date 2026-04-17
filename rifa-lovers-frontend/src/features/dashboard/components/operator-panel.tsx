import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Radio, Trophy, Users, ChevronRight } from 'lucide-react'
import type { Raffle } from '@/types/domain.types'

interface OperatorPanelProps {
  raffles: Raffle[]
}

const statusLabels: Record<string, { label: string; variant: 'gradient' | 'outline-primary' | 'subtle' | 'success' }> = {
  active: { label: 'Activa', variant: 'success' },
  closed: { label: 'Lista para sorteo', variant: 'gradient' },
  drawn: { label: 'Sorteada', variant: 'outline-primary' },
  draft: { label: 'Borrador', variant: 'subtle' },
}

export function OperatorPanel({ raffles }: OperatorPanelProps) {
  const closedRaffles = raffles.filter(r => r.status === 'closed')
  const drawnRaffles = raffles.filter(r => r.status === 'drawn')
  const activeRaffles = raffles.filter(r => r.status === 'active')

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-rl">
          <Radio className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Panel de Operador</h2>
          <p className="text-sm text-text-secondary">
            Gestiona sorteos y transmisiones en vivo
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center glass-light">
          <div className="text-2xl font-bold text-primary">{closedRaffles.length}</div>
          <div className="text-xs text-text-secondary mt-1">Listas para sorteo</div>
        </Card>
        <Card className="p-4 text-center glass-light">
          <div className="text-2xl font-bold text-text-primary">{activeRaffles.length}</div>
          <div className="text-xs text-text-secondary mt-1">Activas</div>
        </Card>
        <Card className="p-4 text-center glass-light">
          <div className="text-2xl font-bold text-text-secondary">{drawnRaffles.length}</div>
          <div className="text-xs text-text-secondary mt-1">Sorteadas</div>
        </Card>
      </div>

      {/* Closed raffles - ready to draw */}
      {closedRaffles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Rifas listas para sortear
          </h3>
          {closedRaffles.map(raffle => (
            <Card key={raffle.id} className="p-4 glass-light border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="size-5 text-primary" />
                  <div>
                    <div className="font-semibold text-text-primary">{raffle.title}</div>
                    <div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                      <Users className="size-3" />
                      <span>Meta: {raffle.goalPacks} packs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusLabels[raffle.status]?.variant || 'subtle'}>
                    {statusLabels[raffle.status]?.label || raffle.status}
                  </Badge>
                  <Link to={`/stream/${raffle.id}`}>
                    <Button size="sm" variant="primary" className="gap-1.5">
                      <Radio className="size-3.5" />
                      Ir al Sorteo
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Drawn raffles */}
      {drawnRaffles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Sorteos realizados
          </h3>
          {drawnRaffles.map(raffle => (
            <Card key={raffle.id} className="p-4 glass-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="size-5 text-text-secondary" />
                  <div>
                    <div className="font-semibold text-text-primary">{raffle.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline-primary">Sorteada</Badge>
                  <Link to={`/raffle/${raffle.id}/winners`}>
                    <Button size="sm" variant="outline-primary" className="gap-1.5">
                      Ver Ganadores
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Active raffles */}
      {activeRaffles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Rifas activas (en venta)
          </h3>
          {activeRaffles.map(raffle => (
            <Card key={raffle.id} className="p-4 glass-light opacity-75">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-text-secondary" />
                  <div>
                    <div className="font-semibold text-text-primary">{raffle.title}</div>
                    <div className="text-xs text-text-secondary">
                      Meta: {raffle.goalPacks} packs
                    </div>
                  </div>
                </div>
                <Badge variant="success">Activa</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {raffles.length === 0 && (
        <Card className="p-8 glass-light text-center">
          <p className="text-text-secondary">No hay rifas disponibles</p>
        </Card>
      )}
    </div>
  )
}
