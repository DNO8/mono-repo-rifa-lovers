import { useRef, useEffect, useCallback } from 'react'
import { ArrowRight, Bell, Hand } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/shared/split-text'
import { HeroModelViewer } from '../components/hero-model-viewer'
import { HeroLiveFrame } from '../components/hero-live-frame'

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
      className="relative min-h-screen overflow-hidden"
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

      {/* ── Desktop: text overlay left + model right ── */}
      {/* ── Mobile: stacked — text top, model bottom ── */}
      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left: Copy overlay */}
        <div className="relative z-20 flex flex-col justify-center px-6 md:px-12 lg:px-10 xl:px-16 pt-24 pb-8 lg:py-0 lg:w-[38%] xl:w-[40%]">
          <div data-gsap>
            <Badge variant="gradient" className="mb-5">
              <div className="size-2 rounded-full bg-white animate-pulse" />
              EN VIVO AHORA
            </Badge>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[2.75rem] xl:text-7xl leading-[1.15] tracking-tight mb-5"
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
            className="text-base md:text-lg text-text-secondary max-w-xl mb-6"
          >
            Así funciona Rifa Lovers en simple
          </p>

          <div data-gsap className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
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
        <div
          data-gsap
          className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8 lg:px-4 xl:px-8 lg:py-16"
        >
          <div className="w-full max-w-[700px]">
            <HeroLiveFrame>
              <HeroModelViewer />
            </HeroLiveFrame>
            <p className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary mt-3 opacity-60">
              <Hand className="size-3.5" />
              Arrastra o scrollea para interactuar
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
