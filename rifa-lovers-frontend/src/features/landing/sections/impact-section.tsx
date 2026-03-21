import { useRef, type ComponentType, type SVGProps } from 'react'
import { ArrowRight, Check, Lock, GraduationCap, Tablet, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { useCountUp } from '@/hooks/use-count-up'
import { MILESTONES, IMPACT_METRICS } from '@/lib/constants'
import { ConfettiCanvas, type ConfettiRef } from '@/components/shared/confetti-canvas'
import { cn } from '@/lib/utils'

const MILESTONE_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  GraduationCap,
  Tablet,
  Heart,
}

function MetricCard({ metric }: { metric: typeof IMPACT_METRICS[number] }) {
  const countRef = useCountUp({
    end: metric.numericValue,
    prefix: metric.prefix,
    suffix: metric.suffix,
  })

  return (
    <div className="text-center">
      <span
        ref={countRef}
        className="block text-xl sm:text-3xl md:text-4xl font-extrabold gradient-text mb-1"
      />
      <span className="text-sm text-text-secondary">{metric.label}</span>
    </div>
  )
}

export function ImpactSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })
  const confettiRef = useRef<ConfettiRef>(null)

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
          {IMPACT_METRICS.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {MILESTONES.map((milestone) => {
            const IconComponent = MILESTONE_ICONS[milestone.icon]
            const isCompleted = milestone.status === 'completed'
            const isActive = milestone.status === 'active'
            const isLocked = milestone.status === 'locked'

            return (
              <Card
                key={milestone.id}
                variant={isActive ? 'highlight' : isCompleted ? 'glass' : 'default'}
                className={cn(
                  'relative p-6 cursor-pointer glass-hover',
                  isLocked && 'opacity-60'
                )}
                onClick={(e) => handleMilestoneClick(milestone.status, e)}
              >
                {/* Status indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      'size-8 rounded-full flex items-center justify-center',
                      isCompleted && 'bg-success/10',
                      isActive && 'bg-primary/10 animate-pulse-subtle',
                      isLocked && 'bg-bg-muted'
                    )}
                  >
                    {isCompleted && <Check className="size-4 text-success" />}
                    {isActive && IconComponent && <IconComponent className="size-4 text-primary" />}
                    {isLocked && <Lock className="size-4 text-text-tertiary" />}
                  </div>
                  <Badge
                    variant={isCompleted ? 'success' : isActive ? 'subtle' : 'muted'}
                  >
                    {isCompleted ? 'Completado' : isActive ? 'En progreso' : 'Próximo'}
                  </Badge>
                </div>

                <h3 className="font-bold text-text-primary mb-1">{milestone.title}</h3>
                <p className="text-sm text-text-secondary">{milestone.description}</p>

                {isCompleted && (
                  <p className="text-xs text-success mt-2 font-medium">
                    ¡Click para celebrar! 🎉
                  </p>
                )}
              </Card>
            )
          })}
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
