import { ChevronLeft, ChevronRight, Trophy, Calendar, Ticket, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { WINNERS, SHOW_WINNERS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { useCarousel } from '@/hooks/use-carousel'
import { useDrawResults } from '@/hooks/use-draw'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { SplitText } from '@/components/shared/split-text'
import { cn } from '@/lib/utils'

// Fallback winner type for static data
interface StaticWinner {
  id: string
  prize: string
  prizeEmoji: string
  raffleName: string
  name: string
  avatar: string
  date: string
}

// Transform API draw results to winner format
function transformDrawResults(results: ReturnType<typeof useDrawResults>['results']) {
  if (!results?.winners?.length) return null
  
  return results.winners.map((winner, index) => ({
    id: winner.luckyPassId || `winner-${index}`,
    prize: winner.prizeName,
    prizeEmoji: '🏆',
    raffleName: `LuckyPass #${winner.passNumber}`,
    name: winner.userName || winner.userEmail?.split('@')[0] || 'Ganador',
    avatar: winner.userName?.[0]?.toUpperCase() || '👤',
    date: new Date(results.drawnAt).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  }))
}

export function WinnersSection() {
  const sectionRef = useGsapScroll<HTMLElement>()
  const { raffle } = useActiveRaffle()
  const { results, isLoading } = useDrawResults(raffle?.id)
  
  const isRealDraw = !!results?.winners?.length
  const shouldShow = isRealDraw || SHOW_WINNERS
  const displayWinners: StaticWinner[] = (shouldShow ? transformDrawResults(results) || WINNERS : [])
  
  const {
    trackRef, current, setIsPaused, snapTo, goNext, goPrev, dragHandlers,
  } = useCarousel({ total: displayWinners.length, autoAdvanceMs: 4000 })

  if (!shouldShow) return null

  return (
    <section
      ref={sectionRef}
      id="ganadores"
      className="px-4 md:px-8 py-16 md:py-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
          {...dragHandlers}
        >
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
          <div ref={trackRef} className="flex gap-5 will-change-transform">
            {displayWinners.map((winner, i) => (
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
                  {isRealDraw ? (
                    <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full">
                      <User className="size-4" />
                      <span className="font-medium">{winner.name}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl">{winner.avatar}</span>
                      <div>
                        <span className="font-semibold text-text-primary block">{winner.name}</span>
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <Calendar className="size-3" />
                          {winner.date}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>

        {/* Real draw indicator */}
        {isRealDraw && !isLoading && (
          <div className="text-center mt-4">
            <Badge variant="success" className="gap-1">
              <Ticket className="size-3" />
              Resultados oficiales del sorteo
            </Badge>
            <p className="text-xs text-text-tertiary mt-1">
              Realizado el {new Date(results?.drawnAt || '').toLocaleString('es-CL')}
            </p>
          </div>
        )}

        {/* Navigation */}
        {!isLoading && (
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
            {displayWinners.map((_, i) => (
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
        )}
      </div>
    </section>
  )
}
