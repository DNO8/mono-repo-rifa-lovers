import { Link } from 'react-router'
import { ArrowRight, Shield, Target, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { useCountUp } from '@/hooks/use-count-up'

const ABOUT_STATS = [
  { label: 'Sorteos realizados', value: 48, prefix: '+' },
  { label: 'Participantes activos', value: 8000, prefix: '+' },
  { label: 'En impacto entregado', value: 24, prefix: '$', suffix: 'M' },
]

function StatItem({ stat }: { stat: typeof ABOUT_STATS[number] }) {
  const countRef = useCountUp({
    end: stat.value,
    prefix: stat.prefix,
    suffix: stat.suffix,
  })

  return (
    <div className="text-center">
      <span ref={countRef} className="block text-2xl md:text-3xl font-extrabold gradient-text mb-1" />
      <span className="text-sm text-text-secondary">{stat.label}</span>
    </div>
  )
}

export function AboutTeamSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24 bg-bg-muted"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Nuestra misión</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Más que sorteos, un movimiento
          </SplitText>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto">
            Creamos una plataforma donde la suerte y la solidaridad se encuentran.
            Cada ticket vendido es una promesa de impacto real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="soft-purple" className="p-6">
            <Shield className="size-8 text-primary mb-4" />
            <h3 className="font-bold text-text-primary mb-2">Seguridad</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Pagos protegidos, sorteos en vivo y resultados verificables por cualquier participante.
            </p>
          </Card>

          <Card variant="soft-pink" className="p-6">
            <Target className="size-8 text-secondary mb-4" />
            <h3 className="font-bold text-text-primary mb-2">Propósito</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Cada peso recaudado tiene un destino claro: becas, tecnología educativa y apoyo comunitario.
            </p>
          </Card>

          <Card variant="warm" className="p-6">
            <Sparkles className="size-8 text-tertiary mb-4" />
            <h3 className="font-bold text-text-primary mb-2">Innovación</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Tecnología de punta para garantizar transparencia y la mejor experiencia para nuestra comunidad.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {ABOUT_STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/impacto">
            <Button variant="primary" size="lg">
              Ver nuestro impacto
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
