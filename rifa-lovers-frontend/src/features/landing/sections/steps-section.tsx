import { ClipboardList, Gift, Radio, Award } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { STEPS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  ClipboardList,
  Gift,
  Radio,
  Award,
}

export function StepsSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Cómo funciona</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            4 pasos para ganar y dar
          </SplitText>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => {
            const IconComponent = ICON_MAP[step.icon]
            return (
              <Card
                key={step.id}
                variant={step.isHighlighted ? 'highlight' : 'glass-light'}
                className={cn(
                  'relative p-6 group glass-hover',
                  step.isHighlighted && 'ring-1 ring-primary/20'
                )}
              >
                {/* Step icon */}
                <div
                  className="size-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: step.bgColor }}
                >
                  {IconComponent && (
                    <IconComponent className="size-6" style={{ color: step.color }} />
                  )}
                </div>

                {/* Step badge */}
                <Badge
                  variant="step"
                  className="mb-2"
                  style={{ color: step.color }}
                >
                  PASO {step.number}
                </Badge>

                {/* Content */}
                <h3 className="font-bold text-text-primary text-[15px] mb-1.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-60"
                  style={{ backgroundColor: step.color }}
                />
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
