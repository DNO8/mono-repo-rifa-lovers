import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { MetricCard } from '@/components/shared/metric-card'
import { MilestoneCard } from '@/components/shared/milestone-card'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { ConfettiCanvas, type ConfettiRef } from '@/components/shared/confetti-canvas'
import type { Milestone, ImpactMetric } from '@/types/domain.types'

function buildMilestones(raffle: ReturnType<typeof useActiveRaffle>['raffle']): Milestone[] {
  const milestones = raffle?.milestones ?? []
  const sorted = [...milestones].sort((a, b) => a.sortOrder - b.sortOrder)
  const firstPendingIdx = sorted.findIndex((m) => !m.isUnlocked)

  return sorted.map((m, i) => ({
    id: m.id,
    threshold: m.requiredPacks,
    emoji: m.isUnlocked ? '✅' : '🔒',
    name: m.name ?? `Hito ${m.sortOrder}`,
    title: m.name ?? `Hito ${m.sortOrder}`,
    description: m.prizes.map((p) => p.name).filter(Boolean).join(', ') || 'Premio por revelar',
    status: m.isUnlocked ? 'completed' : (!m.isUnlocked && i === firstPendingIdx) ? 'active' : 'locked',
    icon: '/icons/cart.svg',
  }))
}

function buildMetrics(
  progress: ReturnType<typeof useActiveRaffle>['progress'],
  raffle: ReturnType<typeof useActiveRaffle>['raffle'],
): ImpactMetric[] {
  const packsSold = progress?.packsSold ?? 0
  const goalPacks = raffle?.goalPacks ?? 1
  const pct = Math.min((packsSold / goalPacks) * 100, 100)
  
  // Debug temporal
  console.log('Debug milestones:', raffle?.milestones)
  console.log('Debug packsSold:', packsSold, 'goalPacks:', goalPacks)

  return [
    {
      id: 'metric-packs',
      label: 'LuckyPass vendidos',
      value: `+${packsSold.toLocaleString('es-CL')}`,
      numericValue: packsSold,
      prefix: '+',
    },
    {
      id: 'metric-progress',
      label: 'progreso hacia la meta',
      value: `${Math.round(pct)}%`,
      numericValue: Math.round(pct),
      suffix: '%',
    },
    {
      id: 'metric-prizes',
      label: 'premios desbloqueados',
      value: '0',
      numericValue: 0,
      prefix: '+',
    },
  ]
}

export function ImpactSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })
  const confettiRef = useRef<ConfettiRef>(null)
  const { raffle, progress } = useActiveRaffle()

  const milestones = buildMilestones(raffle)
  const metrics = buildMetrics(progress, raffle)

  // Count unlocked prizes for the metric
  const unlockedPrizes = (raffle?.milestones ?? [])
    .filter((m) => m.isUnlocked)
    .reduce((acc, m) => acc + m.prizes.length, 0)
  metrics[2] = {
    ...metrics[2],
    value: `+${unlockedPrizes}`,
    numericValue: unlockedPrizes,
  }

  const handleMilestoneClick = (status: string, e: React.MouseEvent) => {
    if (status === 'completed') {
      confettiRef.current?.fire(e.clientX, e.clientY)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="impacto"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24 relative"
    >
      <ConfettiCanvas ref={confettiRef} />

      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Impacto Social</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Esto es lo que ya logramos juntos
          </SplitText>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12 md:mb-16">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onClick={(e) => handleMilestoneClick(milestone.status, e)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="primary" size="lg">
            Participar ahora
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
