import { Badge } from '@/components/ui/badge'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { MetricCard } from '@/components/shared/metric-card'
import { IMPACT_METRICS } from '@/lib/constants'

export function ImpactStatsSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24 bg-bg-muted"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Números reales</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Esto es lo que ya logramos juntos
          </SplitText>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto">
            Cada cifra representa personas reales, comunidades transformadas y sonrisas generadas
            gracias a tu participación.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {IMPACT_METRICS.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  )
}
