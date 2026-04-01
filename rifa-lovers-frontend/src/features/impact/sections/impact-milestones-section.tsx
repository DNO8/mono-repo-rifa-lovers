import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { MilestoneCard } from '@/components/shared/milestone-card'
import { ConfettiCanvas, type ConfettiRef } from '@/components/shared/confetti-canvas'
import { MILESTONES } from '@/lib/constants'

export function ImpactMilestonesSection() {
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
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24 relative"
    >
      <ConfettiCanvas ref={confettiRef} />

      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Metas colectivas</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Hitos que cambian vidas
          </SplitText>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto">
            Cada meta cumplida es una promesa honrada. Juntos desbloqueamos impacto real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {MILESTONES.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onClick={(e) => handleMilestoneClick(milestone.status, e)}
            />
          ))}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="primary" size="lg">
              Participar y desbloquear metas
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
