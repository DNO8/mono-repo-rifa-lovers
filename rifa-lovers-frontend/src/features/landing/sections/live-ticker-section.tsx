import { useEffect, useRef } from 'react'
import { Ticket, Zap } from 'lucide-react'
import { LIVE_ACTIVITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

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
