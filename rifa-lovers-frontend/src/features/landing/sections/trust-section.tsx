import { ShieldCheck, Radio, Eye, CheckCircle, ArrowRight, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Verificación transparente',
    description: 'Cada LuckyPass queda registrado y verificable en nuestro sistema.',
    color: '#7B3FE4',
  },
  {
    icon: Radio,
    title: 'Sorteos en vivo certificados',
    description: 'Todos los sorteos son transmitidos en tiempo real, sin ediciones ni trucos.',
    color: '#FF4DA6',
  },
  {
    icon: Eye,
    title: 'Impacto visible',
    description: 'Puedes ver exactamente a dónde va cada peso y qué causas se apoyan.',
    color: '#FF8A3D',
  },
]

export function TrustSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })

  return (
    <section
      ref={sectionRef}
      id="transparencia"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: copy + bullets */}
          <div className="flex-1">
            <Badge variant="subtle" className="mb-4">100% Transparente</Badge>

            <SplitText
              as="h2"
              className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3"
              type="words"
              stagger={0.05}
              duration={0.6}
            >
              Todo es real. Todo es transparente.
            </SplitText>

            <p className="text-text-secondary mb-2">
              Sin trucos · Sin letra chica · Sin dudas
            </p>

            <div className="space-y-5 mb-8">
              {TRUST_POINTS.map((point) => (
                <div key={point.title} className="flex gap-3">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${point.color}15` }}
                  >
                    <point.icon className="size-5" style={{ color: point.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm mb-0.5">{point.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-1.5">
                <span className="text-sm">🧑🏻</span>
                <span className="text-sm">👩🏽</span>
                <span className="text-sm">🧑🏼</span>
              </div>
              <span className="text-xs text-text-tertiary">
                <Users className="size-3 inline mr-0.5" />
                Miles de personas ya participan con total confianza
              </span>
            </div>

            <Button variant="primary" size="lg">
              Participar con confianza
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Right: verification card */}
          <div className="flex-1 w-full max-w-[420px]">
            <Card variant="glass" className="p-6 md:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <Badge variant="gradient" className="gap-1">
                  <ShieldCheck className="size-3" />
                  VERIFICADO
                </Badge>
                <span className="text-xs text-text-tertiary font-mono">LP-14582</span>
              </div>

              {/* Mock LuckyPass holder */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border-light">
                <div className="size-11 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg">
                  🧑🏻
                </div>
                <div>
                  <span className="font-bold text-text-primary text-sm block">Juan Pérez</span>
                  <span className="text-xs text-text-tertiary">Santiago, Chile</span>
                </div>
              </div>

              {/* Verification checks */}
              <div className="space-y-3">
                <VerifyRow label="Participación verificada" checked />
                <VerifyRow label="LuckyPass válido" checked />
                <VerifyRow label="Registrado en sistema" checked />
                <VerifyRow label="Sorteo asignado: PC Gamer RTX 4080" checked />
              </div>

              {/* Timestamp */}
              <div className="mt-5 pt-4 border-t border-border-light text-center">
                <span className="text-[10px] text-text-tertiary font-mono">
                  Verificado el 15 mar 2025 · 14:32 GMT-4
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function VerifyRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`size-5 rounded-full flex items-center justify-center ${checked ? 'bg-success/10' : 'bg-bg-muted'}`}>
        <CheckCircle className={`size-3.5 ${checked ? 'text-success' : 'text-text-tertiary'}`} />
      </div>
      <span className="text-sm text-text-primary">{label}</span>
    </div>
  )
}
