import { useRef, useEffect } from 'react'
import { Lock, Zap, Trophy, Gift } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { gsap } from '@/lib/gsap'
import { MILESTONES, ACTIVE_RAFFLE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/types/domain.types'

/* ── Flash Campaign Config (will come from backend) ── */
const FLASH_CAMPAIGN = {
  isActive: true,
  message: 'Sorteos express de Giftcards en días especiales',
  detail: 'Síguenos en Instagram para enterarte primero',
}

function thresholdLabel(threshold: number | 'flash'): string {
  return typeof threshold === 'number' ? threshold.toLocaleString('es-CL') : 'FLASH'
}

function MilestoneNode({ milestone, isLast }: { milestone: Milestone; isLast: boolean }) {
  const isCompleted = milestone.status === 'completed'
  const isActive = milestone.status === 'active'

  return (
    <div className="flex flex-col items-center shrink-0 w-[110px] sm:w-auto sm:flex-1 relative">
      {/* Dot + horizontal connector */}
      <div className="flex items-center w-full">
        {/* Left connector */}
        <div
          data-ms-line
          className={cn(
            'h-0.5 flex-1 origin-left',
            isCompleted ? 'bg-success/30' : 'bg-border-light',
          )}
        />

        {/* Dot */}
        <div
          data-ms-dot
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full shrink-0',
            isCompleted && 'size-9 bg-success/15 ring-2 ring-success/30',
            isActive && 'size-9 bg-primary/15 ring-2 ring-primary/40 animate-pulse-subtle',
            !isCompleted && !isActive && 'size-9 bg-bg-muted ring-2 ring-border-light'
          )}
        >
          {(isCompleted || isActive) && (
            <img src={milestone.icon} alt={milestone.name} className="size-5" />
          )}
          {!isCompleted && !isActive && <Lock className="size-3.5 text-text-tertiary" />}
        </div>

        {/* Right connector */}
        {!isLast ? (
          <div
            data-ms-line
            className={cn(
              'h-0.5 flex-1 origin-left',
              isCompleted ? 'bg-success/30' : 'bg-border-light'
            )}
          />
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Content below the dot */}
      <div data-ms-label className="text-center mt-2 px-1">
        <Badge
          variant={isCompleted ? 'success' : isActive ? 'subtle' : 'muted'}
          className="text-[8px] px-1.5 py-0 leading-relaxed mb-1"
        >
          {thresholdLabel(milestone.threshold)}
        </Badge>
        <p className={cn(
          'text-[11px] font-bold leading-tight mb-0.5',
          isCompleted && 'text-success',
          isActive && 'text-primary',
          !isCompleted && !isActive && 'text-text-tertiary'
        )}>
          {milestone.name}
        </p>
        <p className={cn(
          'text-[9px] leading-snug',
          isCompleted || isActive ? 'text-text-secondary' : 'text-text-tertiary'
        )}>
          {milestone.description}
        </p>
      </div>
    </div>
  )
}

function FlashCampaignBanner() {
  if (!FLASH_CAMPAIGN.isActive) return null

  return (
    <div data-ms-banner className="relative mt-4 rounded-xl overflow-hidden cursor-pointer group">
      {/* Shimmer border effect */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          padding: '1.5px',
          background: 'linear-gradient(90deg, transparent, #F59E0B, #FF8A3D, #F59E0B, transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/4">
        {/* Icon cluster */}
        <div className="relative shrink-0">
          <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/15 transition-colors duration-200">
            <img src="/icons/instagram.svg" alt="Instagram" className="size-5" />
          </div>
          <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white shadow-sm flex items-center justify-center ring-1 ring-warning/20">
            <Gift className="size-3 text-warning" />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary leading-tight flex items-center gap-1.5">
            {FLASH_CAMPAIGN.message}
          </p>
          <p className="text-[11px] text-text-tertiary leading-snug mt-0.5">
            {FLASH_CAMPAIGN.detail}
          </p>
        </div>

        {/* Pill badge */}
        <Badge
          variant="muted"
          className="bg-warning/10 text-warning border-warning/20 text-[9px] px-2 shrink-0 hidden sm:flex"
        >
          <Zap className="size-2.5" />
          Flash
        </Badge>
      </div>
    </div>
  )
}

export function MilestoneTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = timelineRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const dots = el.querySelectorAll<HTMLElement>('[data-ms-dot]')
    const lines = el.querySelectorAll<HTMLElement>('[data-ms-line]')
    const labels = el.querySelectorAll<HTMLElement>('[data-ms-label]')
    const banner = el.querySelector<HTMLElement>('[data-ms-banner]')

    gsap.set(dots, { scale: 0, opacity: 0 })
    gsap.set(lines, { scaleX: 0 })
    gsap.set(labels, { opacity: 0, y: 12 })
    if (banner) gsap.set(banner, { opacity: 0, y: 16 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })

    // Animate each milestone sequentially: left-line → dot → right-line → label
    const nodeCount = dots.length
    for (let i = 0; i < nodeCount; i++) {
      const leftLine = lines[i * 2]       // each node has 2 lines (left + right)
      const rightLine = lines[i * 2 + 1]
      const dot = dots[i]
      const label = labels[i]
      const offset = i === 0 ? 0 : '-=0.15' // overlap each milestone slightly

      if (leftLine) tl.to(leftLine, { scaleX: 1, duration: 0.25, ease: 'power2.out' }, offset)
      tl.to(dot, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, '-=0.1')
      if (rightLine) tl.to(rightLine, { scaleX: 1, duration: 0.25, ease: 'power2.out' }, '-=0.15')
      tl.to(label, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, '-=0.2')
    }

    // Flash banner slides in after all milestones
    if (banner) {
      tl.to(banner, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.1')
    }

    return () => { tl.kill() }
  }, [])

  return (
    <Card variant="glass" className="p-4 md:p-6">
      <div className="text-center mb-4">
        <Badge variant="gradient" className="mb-2">
          <Trophy className="size-3" />
          Escala de Premios
        </Badge>
        <p className="text-xs text-text-secondary">
          {ACTIVE_RAFFLE.soldCount.toLocaleString('es-CL')} / {ACTIVE_RAFFLE.totalTickets.toLocaleString('es-CL')} LuckyPass vendidos
        </p>
      </div>

      <div ref={timelineRef}>
        {/* Horizontal scrollable on mobile, full flex on desktop */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-hide">
          <div className="flex min-w-[550px] md:min-w-0">
            {MILESTONES.map((milestone, i) => (
              <MilestoneNode
                key={milestone.id}
                milestone={milestone}
                isLast={i === MILESTONES.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Flash campaign alert */}
        <FlashCampaignBanner />
      </div>
    </Card>
  )
}
