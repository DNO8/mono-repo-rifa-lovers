import { useEffect, useRef } from 'react'
import { Ticket, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: Replace with real-time feed from backend when available
interface LiveActivity {
  id: string
  name: string
  action: string
  ticketCount: number
  timeAgo: string
  city: string
}

const MOCK_ACTIVITIES: LiveActivity[] = [
  { id: '1', name: 'María C.', action: 'compró', ticketCount: 5, timeAgo: 'hace 2 min', city: 'Santiago' },
  { id: '2', name: 'Felipe R.', action: 'compró', ticketCount: 10, timeAgo: 'hace 4 min', city: 'Viña del Mar' },
  { id: '3', name: 'Carla M.', action: 'compró', ticketCount: 3, timeAgo: 'hace 7 min', city: 'Concepción' },
  { id: '4', name: 'Diego S.', action: 'compró', ticketCount: 15, timeAgo: 'hace 10 min', city: 'Temuco' },
  { id: '5', name: 'Andrea P.', action: 'compró', ticketCount: 5, timeAgo: 'hace 12 min', city: 'Antofagasta' },
  { id: '6', name: 'Tomás L.', action: 'compró', ticketCount: 10, timeAgo: 'hace 15 min', city: 'Valparaíso' },
  { id: '7', name: 'Valentina G.', action: 'compró', ticketCount: 3, timeAgo: 'hace 18 min', city: 'Rancagua' },
  { id: '8', name: 'Matías F.', action: 'compró', ticketCount: 25, timeAgo: 'hace 22 min', city: 'La Serena' },
  { id: '9', name: 'Javiera H.', action: 'compró', ticketCount: 5, timeAgo: 'hace 25 min', city: 'Iquique' },
  { id: '10', name: 'Sebastián V.', action: 'compró', ticketCount: 10, timeAgo: 'hace 30 min', city: 'Puerto Montt' },
]
const LIVE_ACTIVITIES: LiveActivity[] = MOCK_ACTIVITIES

function TickerItem({ name, action, ticketCount, timeAgo, city }: {
  name: string
  action: string
  ticketCount: number
  timeAgo: string
  city: string
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-border-light shadow-sm shrink-0 text-sm whitespace-nowrap">
      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Ticket className="size-3 text-primary" />
      </div>
      <span className="font-medium text-text-primary">{name}</span>
      <span className="text-text-secondary">{action}</span>
      <span className="font-bold text-primary">{ticketCount} LuckyPass</span>
      <span className="text-text-tertiary">· {city} · {timeAgo}</span>
    </div>
  )
}

export function LiveTickerSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPaused = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let animId = 0
    let scrollPos = 0
    const speed = 0.5

    const animate = () => {
      if (!isPaused.current) {
        scrollPos += speed
        if (scrollPos >= el.scrollWidth / 2) {
          scrollPos = 0
        }
        el.style.transform = `translateX(-${scrollPos}px)`
      }
      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  const doubledActivities = [...LIVE_ACTIVITIES, ...LIVE_ACTIVITIES]

  return (
    <section
      className="py-4 overflow-hidden border-y border-border-light bg-bg-muted/50"
      onMouseEnter={() => { isPaused.current = true }}
      onMouseLeave={() => { isPaused.current = false }}
    >
      <div className="flex items-center gap-2 mb-3 px-4 md:px-8 mx-auto max-w-[1200px]">
        <div className="size-5 rounded-full bg-success/10 flex items-center justify-center animate-pulse-subtle">
          <Zap className="size-3 text-success" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-success">En vivo</span>
      </div>

      <div className={cn('flex gap-3 will-change-transform')} ref={scrollRef}>
        {doubledActivities.map((activity, i) => (
          <TickerItem
            key={`${activity.id}-${i}`}
            name={activity.name}
            action={activity.action}
            ticketCount={activity.ticketCount}
            timeAgo={activity.timeAgo}
            city={activity.city}
          />
        ))}
      </div>
    </section>
  )
}
