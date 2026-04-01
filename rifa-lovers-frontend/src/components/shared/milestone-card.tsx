import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/types/domain.types'

interface MilestoneCardProps {
  milestone: Milestone
  onClick?: (e: React.MouseEvent) => void
}

export function MilestoneCard({ milestone, onClick }: MilestoneCardProps) {
  const isCompleted = milestone.status === 'completed'
  const isActive = milestone.status === 'active'
  const isLocked = milestone.status === 'locked'

  return (
    <Card
      variant={isActive ? 'highlight' : isCompleted ? 'glass' : 'default'}
      className={cn(
        'relative p-6 cursor-pointer glass-hover',
        isLocked && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            'size-8 rounded-full flex items-center justify-center',
            isCompleted && 'bg-success/10',
            isActive && 'bg-primary/10 animate-pulse-subtle',
            isLocked && 'bg-bg-muted'
          )}
        >
          {(isCompleted || isActive) && (
            <img src={milestone.icon} alt={milestone.name} className="size-5" />
          )}
          {isLocked && <Lock className="size-4 text-text-tertiary" />}
        </div>
        <Badge variant={isCompleted ? 'success' : isActive ? 'subtle' : 'muted'}>
          {isCompleted ? 'Completado' : isActive ? 'En progreso' : 'Próximo'}
        </Badge>
      </div>

      <h3 className="font-bold text-text-primary mb-1">{milestone.title}</h3>
      <p className="text-sm text-text-secondary">{milestone.description}</p>

      {isCompleted && (
        <p className="text-xs text-success mt-2 font-medium">
          ¡Click para celebrar!
        </p>
      )}
    </Card>
  )
}
