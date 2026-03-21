import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Step } from '@/types/domain.types'
import type { IconMap } from '@/types/ui.types'

interface StepCardProps {
  step: Step
  iconMap: IconMap
}

export function StepCard({ step, iconMap }: StepCardProps) {
  const IconComponent = iconMap[step.icon]

  return (
    <Card
      key={step.id}
      variant={step.isHighlighted ? 'highlight' : 'glass-light'}
      className={cn(
        'relative p-6 group glass-hover',
        step.isHighlighted && 'ring-1 ring-primary/20'
      )}
    >
      <div
        className="size-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: step.bgColor }}
      >
        {IconComponent && (
          <IconComponent className="size-6" style={{ color: step.color }} />
        )}
      </div>

      <Badge
        variant="step"
        className="mb-2"
        style={{ color: step.color }}
      >
        PASO {step.number}
      </Badge>

      <h3 className="font-bold text-text-primary text-[15px] mb-1.5 leading-snug">
        {step.title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {step.description}
      </p>

      <div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-60"
        style={{ backgroundColor: step.color }}
      />
    </Card>
  )
}
