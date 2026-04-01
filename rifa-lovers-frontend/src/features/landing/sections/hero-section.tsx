import { useRef, useEffect, useCallback } from 'react'
import { ArrowRight, Bell, Hand, Users } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/shared/split-text'
import { HeroModelViewer } from '../components/hero-model-viewer'
import { HeroLiveFrame } from '../components/hero-live-frame'
import { MilestoneTimeline } from '../components/ticket-selector'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const spot = spotlightRef.current
    const section = sectionRef.current
    if (!spot || !section) return
    const rect = section.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spot.style.transform = `translate(${x - 25}px, ${y -25}px)`
    spot.style.opacity = '1'
  }, [])

  const handleMouseLeave = useCallback(() => {
    const spot = spotlightRef.current
    if (spot) spot.style.opacity = '0'
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative px-4 md:px-8 pt-24 md:pt-28 pb-16 md:pb-24"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradient flashlight cursor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div
          ref={spotlightRef}
          className="absolute w-[50px] h-[50px] rounded-full transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(123,63,228,0.13) 0%, rgba(255,77,166,0.09) 40%, rgba(255,138,61,0.05) 65%, transparent 80%)',
            opacity: 0,
            willChange: 'transform',
          }}
        />
      </div>
      <div className="mx-auto max-w-[1400px]">
        {/* Two-column hero: copy left + live frame right */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14 mb-10 lg:mb-14">
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <div data-gsap>
              <Badge variant="gradient" className="mb-5">
                <div className="size-2 rounded-full bg-white animate-pulse" />
                EN VIVO AHORA
              </Badge>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-7xl leading-[1.3] tracking-tight mb-5"
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}
            >
              <SplitText
                as="span"
                className="block text-text-primary"
                type="words"
                stagger={0.06}
                duration={0.7}
                y={30}
                delay={0.3}
              >
                Participa hoy
              </SplitText>
              <SplitText
                as="span"
                className="block text-text-primary"
                type="words"
                stagger={0.06}
                duration={0.7}
                y={30}
                delay={0.7}
              >
                Gana premios
              </SplitText>
              <SplitText
                as="span"
                className="block bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent"
                type="words"
                gradient
                stagger={0.06}
                duration={0.7}
                y={30}
                delay={1.1}
              >
                Impacta vidas
              </SplitText>
            </h1>

            <p
              data-gsap
              className="text-base md:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 mb-4"
            >
              Así funciona Rifa Lovers en simple
            </p>

            <div data-gsap className="flex items-center gap-2 justify-center lg:justify-start mb-6">
              <div className="flex -space-x-2">
                <span className="text-xl">🧑🏻</span>
                <span className="text-xl">👩🏽</span>
                <span className="text-xl">🧑🏼</span>
                <span className="text-xl">👩🏻</span>
              </div>
              <span className="text-sm text-text-secondary">
                <Users className="size-3.5 inline mr-1" />
                +8.000 personas participando
              </span>
            </div>

            <div data-gsap className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="primary" size="lg">
                Ver en vivo ahora
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="secondary" size="lg">
                <Bell className="size-4" />
                Recordarme el sorteo
              </Button>
            </div>
          </div>

          {/* Right: Live frame with 3D model */}
          <div data-gsap className="flex-1 w-full max-w-[620px]">
            <HeroLiveFrame>
              <HeroModelViewer />
            </HeroLiveFrame>
            <p className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary mt-3 opacity-60">
              <Hand className="size-3.5" />
              Arrastra o scrollea para interactuar
            </p>
          </div>
        </div>

        {/* Milestone timeline — full width card below */}
        <div data-gsap className="max-w-4xl mx-auto">
          <MilestoneTimeline />
        </div>
      </div>
    </section>
  )
}
