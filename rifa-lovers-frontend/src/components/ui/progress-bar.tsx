import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  showLabel?: boolean
  className?: string
  animated?: boolean
}

export function ProgressBar({
  value,
  showLabel = false,
  className,
  animated = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5 text-xs font-medium text-text-secondary">
          <span>PROGRESO DE LA RIFA</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full bg-linear-to-r from-primary via-secondary to-tertiary',
            animated && 'transition-[width] duration-600 ease-out'
          )}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
