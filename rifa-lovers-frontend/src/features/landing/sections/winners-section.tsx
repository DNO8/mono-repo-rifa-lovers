import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Trophy, Calendar } from 'lucide-react'
import gsap from 'gsap'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { WINNERS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import { cn } from '@/lib/utils'

export function WinnersSection() {
  const sectionRef = useGsapScroll<HTMLElement>()
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = WINNERS.length
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
    }, 4000)
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
      id="ganadores"
      className="px-4 md:px-8 py-16 md:py-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false) }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <Badge variant="gradient" className="mb-4">
            <Trophy className="size-3.5" />
            Ganadores reales
          </Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.06}
            duration={0.6}
          >
            Ellos ya ganaron
          </SplitText>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            Personas reales que participaron y se llevaron premios increíbles.
          </p>
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
            {WINNERS.map((winner, i) => (
              <Card
                key={winner.id}
                variant="glass"
                className={cn(
                  'p-6 shrink-0 w-[80vw] sm:w-[280px] md:w-[300px] select-none transition-opacity duration-300',
                  i === current ? 'opacity-100' : 'opacity-60'
                )}
              >
                {/* Prize emoji */}
                <div className="text-5xl mb-4 text-center">{winner.prizeEmoji}</div>

                {/* Prize name */}
                <h3 className="font-bold text-text-primary text-center mb-1">{winner.prize}</h3>
                <p className="text-sm text-text-secondary text-center mb-4">{winner.raffleName}</p>

                {/* Winner info */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-2xl">{winner.avatar}</span>
                  <div>
                    <span className="font-semibold text-text-primary block">{winner.name}</span>
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <Calendar className="size-3" />
                      {winner.date}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={goPrev}
            className="size-10 rounded-full bg-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
            aria-label="Anterior ganador"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {WINNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => snapTo(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-text-tertiary'
                )}
                aria-label={`Ganador ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="size-10 rounded-full bg-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
            aria-label="Siguiente ganador"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
