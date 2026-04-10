import { CheckCircle, Circle, Home } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress-bar'

export interface CollectiveImpact {
  progress: number
  nextGoal: string
  remaining: number
  milestones: { id: string; label: string; status: 'done' | 'active' | 'pending'; icon: 'check' | 'circle' | 'home' }[]
}

const ICON_MAP = {
  check: CheckCircle,
  circle: Circle,
  home: Home,
}

const STATUS_COLORS = {
  done: 'bg-success/10 text-success border-success/20',
  active: 'bg-secondary/10 text-secondary border-secondary/20',
  pending: 'bg-bg-muted text-text-tertiary border-border-light',
}

export function DashboardImpactSection({ impact }: { impact: CollectiveImpact }) {
  return (
    <div className="glass-medium rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-base font-bold text-text-primary">Impacto Colectivo</h3>
        <span className="text-2xl font-extrabold text-primary">{impact.progress}%</span>
      </div>

      <p className="text-xs text-text-tertiary mb-4">
        Faltan {impact.remaining.toLocaleString('es-CL')} LuckyPass para {impact.nextGoal}
      </p>

      <ProgressBar value={impact.progress} className="mb-5" />

      <div className="flex flex-wrap gap-2">
        {impact.milestones.map((m) => {
          const Icon = ICON_MAP[m.icon]
          return (
            <div
              key={m.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${STATUS_COLORS[m.status]}`}
            >
              <Icon className="size-3.5" />
              {m.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
