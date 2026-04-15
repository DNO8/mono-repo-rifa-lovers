import { useRef, useEffect, useState } from 'react'
import { ClipboardList, Gift, Radio, Award } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Badge } from '@/components/ui/badge'
import { STEPS } from '@/lib/constants'
import { SplitText } from '@/components/shared/split-text'
import type { IconMap } from '@/types/ui.types'
import type { Step } from '@/types/domain.types'

const STEP_ICONS: IconMap = { ClipboardList, Gift, Radio, Award }

/* ═══════════════════════════════════════════════════════════
   Aurora Gradient Mesh — Canvas 2D (vite.dev style)
   Large soft blobs in brand colors that drift & blend.
   Architecture: init → update → draw → loop
   ═══════════════════════════════════════════════════════════ */

interface AuroraBlob {
  cx: number; cy: number       // base center (fraction 0–1)
  radius: number               // fraction of canvas short side
  color: string                // rgb string
  alpha: number
  xFreq: number; yFreq: number // oscillation frequency
  xAmp: number; yAmp: number   // oscillation amplitude (fraction)
  phase: number                // phase offset
}

const BLOBS: AuroraBlob[] = [
  { cx: 0.15, cy: 0.3,  radius: 0.50, color: '123,63,228',  alpha: 0.35, xFreq: 0.45, yFreq: 0.30, xAmp: 0.30, yAmp: 0.25, phase: 0 },
  { cx: 0.5,  cy: 0.15, radius: 0.45, color: '255,77,166',  alpha: 0.28, xFreq: 0.35, yFreq: 0.50, xAmp: 0.35, yAmp: 0.28, phase: 1.2 },
  { cx: 0.85, cy: 0.4,  radius: 0.48, color: '255,138,61',  alpha: 0.30, xFreq: 0.30, yFreq: 0.40, xAmp: 0.32, yAmp: 0.30, phase: 2.5 },
  { cx: 0.35, cy: 0.75, radius: 0.42, color: '239,68,68',   alpha: 0.22, xFreq: 0.50, yFreq: 0.35, xAmp: 0.28, yAmp: 0.32, phase: 3.8 },
  { cx: 0.7,  cy: 0.7,  radius: 0.40, color: '123,63,228',  alpha: 0.20, xFreq: 0.40, yFreq: 0.32, xAmp: 0.35, yAmp: 0.25, phase: 5.0 },
  { cx: 0.5,  cy: 0.5,  radius: 0.55, color: '255,77,166',  alpha: 0.18, xFreq: 0.22, yFreq: 0.28, xAmp: 0.38, yAmp: 0.35, phase: 6.2 },
]

function drawAurora(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.clearRect(0, 0, w, h)

  // Additive blending for color mixing (like vite.dev)
  ctx.globalCompositeOperation = 'lighter'

  const short = Math.min(w, h)

  for (const b of BLOBS) {
    // Oscillate position with sine/cosine
    const x = (b.cx + Math.sin(time * b.xFreq + b.phase) * b.xAmp) * w
    const y = (b.cy + Math.cos(time * b.yFreq + b.phase * 0.7) * b.yAmp) * h
    const r = b.radius * short

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, `rgba(${b.color},${b.alpha})`)
    grad.addColorStop(0.35, `rgba(${b.color},${b.alpha * 0.7})`)
    grad.addColorStop(0.65, `rgba(${b.color},${b.alpha * 0.3})`)
    grad.addColorStop(1, `rgba(${b.color},0)`)

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Reset composite mode
  ctx.globalCompositeOperation = 'source-over'
}

/* ═══════════════════════════════════════════════════════════
   Step Card Component
   ═══════════════════════════════════════════════════════════ */

function StepCard({
  step,
  iconMap,
  index,
  isActive,
  onHover,
}: {
  step: Step
  iconMap: IconMap
  index: number
  isActive: boolean
  onHover: (index: number | null) => void
}) {
  const IconComponent = iconMap[step.icon]

  return (
    <div
      className="step-card relative rounded-2xl p-6 md:p-7 transition-shadow duration-300 overflow-hidden"
      style={{
        background: isActive
          ? 'rgba(255,255,255,0.92)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: isActive
          ? `1.5px solid ${step.color}40`
          : '1px solid rgba(255,255,255,0.5)',
        boxShadow: isActive
          ? `0 8px 32px ${step.color}18, 0 0 0 1px ${step.color}10`
          : '0 4px 16px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Step number watermark */}
      <span
        className="absolute -top-2 -right-1 text-[5rem] font-extrabold leading-none select-none pointer-events-none"
        style={{ color: step.color, opacity: 0.06 }}
      >
        {step.number}
      </span>

      {/* Top row: icon + badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="size-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: step.bgColor }}
        >
          {IconComponent && (
            <IconComponent className="size-5.5" style={{ color: step.color }} />
          )}
        </div>
        <Badge
          variant="step"
          className="text-[10px]"
          style={{ color: step.color }}
        >
          PASO {step.number}
        </Badge>
        {step.isHighlighted && (
          <Badge variant="gradient" className="text-[10px] px-2 py-0.5 gap-1">
            <div className="size-1.5 rounded-full bg-white animate-pulse" />
            EN VIVO
          </Badge>
        )}
      </div>

      <h3 className="text-text-primary text-base md:text-lg mb-1.5 leading-snug">
        {step.title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {step.description}
      </p>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
          opacity: isActive ? 0.7 : 0,
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Steps Section
   ═══════════════════════════════════════════════════════════ */

export function StepsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef(0)
  const [activeCard, setActiveCard] = useState<number | null>(null)

  const handleCardHover = (index: number | null) => setActiveCard(index)

  // --- Canvas aurora loop ---
  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = devicePixelRatio || 1

    function resize() {
      if (!canvas || !section) return
      const rect = section.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    let time = 0
    function loop() {
      if (!canvas || !ctx) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      time += 0.006
      drawAurora(ctx, w, h, time)
      animFrameRef.current = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // --- GSAP staggered card entrance ---
  useEffect(() => {
    const section = sectionRef.current
    const grid = gridRef.current
    if (!section || !grid) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const cards = grid.querySelectorAll<HTMLElement>('.step-card')
    gsap.set(cards, { y: 60, opacity: 0, scale: 0.95 })

    const tween = gsap.to(cards, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        once: true,
      },
    })

    return () => { tween.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative px-4 md:px-8 py-16 md:py-24 overflow-hidden"
    >
      {/* Canvas aurora background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Cómo funciona</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Así funciona Rifa Lovers en simple
          </SplitText>
          <p className="text-text-secondary max-w-lg mx-auto">
            Tú activas todo este proceso
          </p>
        </div>

        {/* Step cards grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {STEPS.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              iconMap={STEP_ICONS}
              index={i}
              isActive={activeCard === i}
              onHover={handleCardHover}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className="size-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: activeCard === i ? step.color : '#E5E5EA',
                transform: activeCard === i ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
