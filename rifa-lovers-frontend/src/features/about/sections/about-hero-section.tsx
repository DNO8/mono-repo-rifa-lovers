import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/shared/split-text'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'

export function AboutHeroSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="relative px-4 md:px-8 pt-24 md:pt-32 pb-16 md:pb-24"
    >
      <div className="mx-auto max-w-[1200px] text-center">
        <Badge variant="gradient" className="mb-5">Nosotros</Badge>

        <SplitText
          as="h1"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-text-primary mb-5"
          type="words"
          stagger={0.06}
          duration={0.7}
        >
          Rediseñando la generosidad digital
        </SplitText>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
          RifaLovers nació con una idea simple: que participar en sorteos pueda cambiar vidas.
          No solo la tuya — sino la de comunidades que más lo necesitan.
        </p>
      </div>
    </section>
  )
}
