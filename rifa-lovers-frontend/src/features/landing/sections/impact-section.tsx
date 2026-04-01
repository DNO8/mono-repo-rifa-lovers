import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { MetricCard } from '@/components/shared/metric-card'
import { MilestoneCard } from '@/components/shared/milestone-card'
import { MILESTONES, IMPACT_METRICS } from '@/lib/constants'
import { ConfettiCanvas, type ConfettiRef } from '@/components/shared/confetti-canvas'

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
          {MILESTONES.map((milestone) => (
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
