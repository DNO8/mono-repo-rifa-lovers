import { Shield, Code, Scale, Building } from 'lucide-react'
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
          <Badge variant="subtle" className="mb-4">Respaldo profesional</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Asesoría y{' '}
            <span className="gradient-text">respaldo de primer nivel</span>
          </h2>
          <p className="text-text-secondary mt-3 max-w-lg mx-auto">
            Operamos con el respaldo de profesionales y empresas líderes en sus áreas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legal Card */}
          <Card variant="glass-light" className="p-6 md:p-8 glass-hover">
            <div className="flex items-start gap-4 mb-5">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Scale className="size-6 text-primary" />
              </div>
              <div>
                <Badge variant="outline-primary" className="mb-2 text-xs">Respaldo Jurídico</Badge>
                <h3 className="text-lg font-bold text-text-primary">Asesoría Legal</h3>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <Shield className="size-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary text-sm">Katherynne Moreno Ortiz</p>
                  <p className="text-xs text-text-secondary">Abogada Senior</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="size-4 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-text-secondary">
                    Derecho Corporativo, Inmobiliario y Data Compliance
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border-light">
              {/* Logo placeholder KRIM */}
              <div className="h-10 w-24 rounded-lg bg-bg-muted border border-border-light flex items-center justify-center text-[10px] text-text-tertiary font-medium">
                Logo KRIM
              </div>
              <div className="leading-tight">
                <p className="font-semibold text-text-primary text-sm">KRIM Consultores</p>
                <p className="text-xs text-text-tertiary">+ Notaría</p>
              </div>
            </div>
          </Card>

          {/* Tech Card */}
          <Card variant="glass-light" className="p-6 md:p-8 glass-hover">
            <div className="flex items-start gap-4 mb-5">
              <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Code className="size-6 text-secondary" />
              </div>
              <div>
                <Badge variant="outline-primary" className="mb-2 text-xs">Respaldo Técnico</Badge>
                <h3 className="text-lg font-bold text-text-primary">Tecnología & Desarrollo</h3>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-sm text-text-secondary leading-relaxed">
                Infraestructura tecnológica de nivel enterprise. Plataforma desarrollada
                con los más altos estándares de seguridad y escalabilidad.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="size-1.5 rounded-full bg-secondary shrink-0" />
                  Pagos procesados por Flow (certificado PCI-DSS)
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="size-1.5 rounded-full bg-secondary shrink-0" />
                  Sorteo en vivo con algoritmo verificable
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="size-1.5 rounded-full bg-secondary shrink-0" />
                  Datos protegidos con encriptación end-to-end
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border-light">
              {/* Logo placeholder Innovaxchain */}
              <div className="h-10 w-28 rounded-lg bg-bg-muted border border-border-light flex items-center justify-center text-[10px] text-text-tertiary font-medium">
                Logo Innovaxchain
              </div>
              <div className="leading-tight">
                <p className="font-semibold text-text-primary text-sm">Innovaxchain</p>
                <p className="text-xs text-text-tertiary">Infraestructura & Desarrollo</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
