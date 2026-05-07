import { Badge } from '@/components/ui/badge'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'

export function ContactHeroSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="relative px-4 md:px-8 pt-24 md:pt-32 pb-16 md:pb-24"
    >
      <div className="mx-auto max-w-[1200px] text-center">
        <Badge variant="gradient" className="mb-5">SOPORTE Y COMUNIDAD</Badge>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-text-primary mb-5">
          Estamos aquí para ayudarte 💜
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
          ¿Tienes dudas sobre packs, campañas o beneficios?
          Nuestro equipo y comunidad están disponibles para ayudarte en cada etapa de la experiencia RifaLovers.
        </p>
      </div>
    </section>
  )
}
