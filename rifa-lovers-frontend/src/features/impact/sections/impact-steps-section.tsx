import { ClipboardList, Gift, Radio, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StepCard } from '@/components/shared/step-card'
import { STEPS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import type { IconMap } from '@/types/ui.types'

const STEP_ICONS: IconMap = {
  ClipboardList,
  Gift,
  Radio,
  Award,
}

export function ImpactStepsSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Cómo funciona</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Tu participación genera impacto en 4 pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <StepCard key={step.id} step={step} iconMap={STEP_ICONS} />
          ))}
        </div>
      </div>
    </section>
  )
}
