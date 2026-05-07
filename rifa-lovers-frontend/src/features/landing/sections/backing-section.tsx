import { Shield, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'

export function BackingSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[900px]">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <Badge variant="subtle" className="mb-4">Transparencia real</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Lives públicos y campañas verificables para toda nuestra comunidad.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LuckyPass Card */}
          <Card variant="glass-light" className="p-6 md:p-8 glass-hover">
            <div className="flex items-start gap-4 mb-5">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Scale className="size-6 text-primary" />
              </div>
              <div>
                <Badge variant="outline-primary" className="mb-2 text-xs">Transparencia</Badge>
                <h3 className="text-lg font-bold text-text-primary">LuckyPass exclusivo</h3>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Participaciones individuales asociadas a campañas activas.
            </p>
          </Card>

          {/* Impact Card */}
          <Card variant="glass-light" className="p-6 md:p-8 glass-hover">
            <div className="flex items-start gap-4 mb-5">
              <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Shield className="size-6 text-secondary" />
              </div>
              <div>
                <Badge variant="outline-primary" className="mb-2 text-xs">Comunidad</Badge>
                <h3 className="text-lg font-bold text-text-primary">Impacto positivo</h3>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Experiencias que también buscan generar valor para otros.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
