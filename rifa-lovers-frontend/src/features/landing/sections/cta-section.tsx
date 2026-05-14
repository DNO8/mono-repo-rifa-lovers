import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { scrollToPricing } from '@/lib/utils'

export function CTASection() {
  const sectionRef = useGsapScroll<HTMLElement>()

  return (
    <section
      ref={sectionRef}
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[800px] text-center glass-medium rounded-2xl p-10 md:p-14">
        <div className="inline-flex items-center gap-2 mb-5 text-primary">
          <Sparkles className="size-5" />
          <span className="text-sm font-bold uppercase tracking-wider">EXPERIENCIAS REALES</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
          Vive la experiencia RifaLovers
        </h2>

        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Packs exclusivos, beneficios promocionales y campañas transparentes para nuestra comunidad.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={scrollToPricing}>
            Obtener mi Pack
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
