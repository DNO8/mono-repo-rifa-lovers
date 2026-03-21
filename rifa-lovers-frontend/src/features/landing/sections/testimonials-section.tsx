import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Trophy, MapPin } from 'lucide-react'
import gsap from 'gsap'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { TESTIMONIALS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types/domain.types'

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card
      variant="glass"
      className="p-6 md:p-8 shrink-0 w-[85vw] sm:w-[340px] md:w-[360px] select-none"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="size-12 rounded-full bg-bg-purple-soft flex items-center justify-center text-2xl">
          {testimonial.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary text-sm truncate">{testimonial.name}</span>
            {testimonial.isWinner && (
              <Badge variant="gradient" className="text-[10px] px-1.5 py-0.5">
                <Trophy className="size-2.5" />
                Ganador
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <MapPin className="size-3" />
            {testimonial.location}
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'size-4',
              i < testimonial.rating ? 'fill-tertiary text-tertiary' : 'text-border'
            )}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {/* Prize won */}
      {testimonial.prizeName && (
        <div className="text-xs font-medium text-primary">
          Premio ganado: {testimonial.prizeName}
        </div>
      )}
    </Card>
  )
}

export function TestimonialsSection() {
  const sectionRef = useGsapScroll<HTMLElement>()
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = TESTIMONIALS.length
  const isDragging = useRef(false)
  const startX = useRef(0)
  const trackX = useRef(0)

  const getSnapX = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return 0
    const card = track.children[index] as HTMLElement | undefined
    if (!card) return 0
    return -(card.offsetLeft - (track.parentElement!.offsetWidth / 2 - card.offsetWidth / 2))
  }, [])

  const snapTo = useCallback((index: number) => {
    const x = getSnapX(index)
    gsap.to(trackRef.current, { x, duration: 0.5, ease: 'power3.out' })
    trackX.current = x
    setCurrent(index)
  }, [getSnapX])

  const goNext = useCallback(() => snapTo((current + 1) % total), [current, total, snapTo])
  const goPrev = useCallback(() => snapTo((current - 1 + total) % total), [current, total, snapTo])

  // Auto-advance
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setCurrent((p) => {
        const next = (p + 1) % total
        const x = getSnapX(next)
        gsap.to(trackRef.current, { x, duration: 0.5, ease: 'power3.out' })
        trackX.current = x
        return next
      })
    }, 5000)
    return () => clearInterval(id)
  }, [isPaused, total, getSnapX])

  // Initial position
  useEffect(() => {
    if (trackRef.current) {
      const x = getSnapX(0)
      gsap.set(trackRef.current, { x })
      trackX.current = x
    }
  }, [getSnapX])

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    setIsPaused(true)
    gsap.killTweensOf(trackRef.current)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    gsap.set(trackRef.current, { x: trackX.current + dx })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const dx = e.clientX - startX.current
    const threshold = 60

    let next = current
    if (dx < -threshold && current < total - 1) next = current + 1
    else if (dx > threshold && current > 0) next = current - 1

    snapTo(next)
    setIsPaused(false)
  }

  return (
    <section
      ref={sectionRef}
      id="testimonios"
      className="px-4 md:px-8 py-16 md:py-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false) }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <Badge variant="subtle" className="mb-4">Testimonios</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Lo que dicen nuestros participantes
          </SplitText>
        </div>

        {/* Draggable Carousel */}
        <div
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div ref={trackRef} className="flex gap-5 will-change-transform">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={goPrev}
            className="size-10 rounded-full bg-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => snapTo(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-border hover:bg-text-tertiary'
                )}
                aria-label={`Testimonio ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="size-10 rounded-full bg-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
