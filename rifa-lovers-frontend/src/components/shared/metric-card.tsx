import { useCountUp } from '@/hooks/use-count-up'
import type { ImpactMetric } from '@/types/domain.types'

interface MetricCardProps {
  metric: ImpactMetric
  className?: string
}

export function MetricCard({ metric, className = '' }: MetricCardProps) {
  const countRef = useCountUp({
    end: metric.numericValue,
    prefix: metric.prefix,
    suffix: metric.suffix,
  })

  return (
    <div className={`text-center p-6 ${className}`}>
      <span
        ref={countRef}
        className="block text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-2"
      />
      <span className="text-sm md:text-base text-text-secondary">{metric.label}</span>
    </div>
  )
}
