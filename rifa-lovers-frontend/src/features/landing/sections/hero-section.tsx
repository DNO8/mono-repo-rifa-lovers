import { useRef, useEffect } from 'react'
import { ArrowRight, Hand, CalendarClock } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LazyHeroModelViewer } from '../components/lazy-hero-model-viewer'
import { useActiveRaffle } from '@/hooks/use-raffles'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const { raffle } = useActiveRaffle()

  const drawDate = raffle?.endDate
    ? new Date(raffle.endDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    : null
  const drawTime = raffle?.endDate
    ? new Date(raffle.endDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : null

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

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

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const spot = spotlightRef.current
    const section = sectionRef.current
    if (!spot || !section) return
    const rect = section.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spot.style.transform = `translate(${x - 25}px, ${y -25}px)`
    spot.style.opacity = '1'
  }

  const handleMouseLeave = () => {
    const spot = spotlightRef.current
    if (spot) spot.style.opacity = '0'
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[85vh] lg:min-h-screen overflow-hidden"
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
      <div className="relative min-h-[85vh] lg:min-h-screen flex flex-col lg:flex-row">
        {/* Left: Copy overlay */}
        <div className="relative z-20 flex flex-col justify-center px-6 md:px-12 lg:px-10 xl:px-16 pt-24 pb-8 lg:py-0 lg:w-[38%] xl:w-[40%]">
          <div data-gsap>
            <Badge variant="gradient" className="mb-5">
              <div className="size-2 rounded-full bg-white animate-pulse" />
              SORTEO EN VIVO
            </Badge>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.5rem] xl:text-6xl leading-[1.15] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}
          >
            <span
              className="block text-text-primary hero-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              Gana un MacBook M5
            </span>
            <span
              className="block bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent hero-fade-up"
              style={{ animationDelay: '0.7s' }}
            >
              desde $4.990
            </span>
          </h1>

          <p
            data-gsap
            className="text-sm md:text-base text-text-secondary max-w-xl mb-2 leading-relaxed"
          >
            y cumple el sueño de los niños de la{' '}
            <span className="font-semibold text-text-primary">Fundación Niño y Cáncer</span>
          </p>

          <p
            data-gsap
            className="text-sm md:text-base text-text-secondary max-w-xl mb-4 leading-relaxed"
          >
            <span className="font-semibold text-primary">3 smartphones y 3 tablets</span>, además
            participas en la escala de desbloqueo de fabulosos premios.
          </p>

          {drawDate && (
            <div data-gsap className="flex items-center gap-2 mb-5 text-sm">
              <CalendarClock className="size-4 text-primary" />
              <span className="text-text-primary font-semibold">
                Sorteo en vivo — {drawDate}{drawTime ? ` a las ${drawTime}` : ''}
              </span>
            </div>
          )}

          <div data-gsap className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
            <Button variant="primary" size="lg" onClick={scrollToPricing}>
              Participar Ahora
              <ArrowRight className="size-4" />
            </Button>
            <a
              href="https://www.facebook.com/profile.php?id=61572258592880"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/15 border border-white/25 rounded-full text-text-primary text-sm font-semibold backdrop-blur-sm hover:bg-white/25 transition-all duration-200 cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Ver sorteo en vivo
            </a>
          </div>
        </div>

        {/* Right: Live frame with 3D model (lazy loaded) */}
        <div
          data-gsap
          className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8 lg:px-4 xl:px-8 lg:py-16"
        >
          <div className="w-full max-w-[700px]">
            <LazyHeroModelViewer />
            <p className="flex items-center justify-center gap-1.5 text-xs text-text-primary mt-3 opacity-60">
              <Hand className="size-3.5" />
              Arrastra para rotar · toca los <span className="font-semibold">números</span> para explorar specs
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
