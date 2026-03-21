import { useRef, useEffect } from 'react'
import { Star, ArrowRight, Eye, Hand } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/shared/split-text'
import { ACTIVE_RAFFLE } from '@/lib/constants'
import { HeroModelViewer } from '../components/hero-model-viewer'
import { TicketSelector } from '../components/ticket-selector'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const targets = el.querySelectorAll('[data-gsap]')
    gsap.set(targets, { y: 30, opacity: 0 })
    const tween = gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.2,
    })
    return () => { tween.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative px-4 md:px-8 pt-24 md:pt-32 pb-16 md:pb-24"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Top: Badge + Heading + Subtitle centered */}
        <div className="text-center mb-8 md:mb-12">
          <div data-gsap>
            <Badge variant="gradient" className="mb-5">
              <Star className="size-3.5" />
              Sorteo activo — {ACTIVE_RAFFLE.name}
            </Badge>
          </div>

          <SplitText
            as="h1"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-text-primary mb-5"
            type="words"
            stagger={0.06}
            duration={0.7}
            y={30}
            delay={0.3}
          >
            Tu suerte crea impacto real.
          </SplitText>

          <p
            data-gsap
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8"
          >
            Participa en sorteos increíbles mientras generas impacto social real.
            Cada ticket cambia una vida.
          </p>

          <div data-gsap className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="lg">
              Participar Ahora
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="secondary" size="lg">
              <Eye className="size-4" />
              Ver impacto actual
            </Button>
          </div>
        </div>

        {/* Bottom: 3D Model + Ticket Selector side by side */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* 3D Model */}
          <div data-gsap className="flex-1 w-full">
            <HeroModelViewer />
            <p className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary mt-2 opacity-60">
              <Hand className="size-3.5" />
              Arrastra o scrollea para interactuar
            </p>
          </div>

          {/* Ticket Selector */}
          <div data-gsap className="w-full max-w-sm mx-auto lg:mx-0 lg:max-w-md shrink-0">
            <TicketSelector />
          </div>
        </div>
      </div>
    </section>
  )
}
