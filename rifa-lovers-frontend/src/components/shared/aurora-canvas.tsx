import { useRef, useEffect } from 'react'

interface AuroraParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
  phase: number
  speed: number
}

const COLORS = [
  'rgba(123, 63, 228,',
  'rgba(255, 77, 166,',
  'rgba(255, 138, 61,',
]

const PARTICLE_COUNT = 6
const BASE_OPACITY = 0.07

function createParticle(w: number, h: number): AuroraParticle {
  const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    radius: Math.random() * 250 + 200,
    color: colorBase,
    opacity: BASE_OPACITY + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    speed: 0.0003 + Math.random() * 0.0004,
  }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio, 2)
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function updateParticles(particles: AuroraParticle[], w: number, h: number, time: { value: number }, dt: number) {
  for (const p of particles) {
    time.value += p.speed * dt
    p.x += p.vx + Math.sin(time.value + p.phase) * 0.3
    p.y += p.vy + Math.cos(time.value + p.phase * 1.3) * 0.2
    if (p.x < -p.radius) p.x = w + p.radius
    if (p.x > w + p.radius) p.x = -p.radius
    if (p.y < -p.radius) p.y = h + p.radius
    if (p.y > h + p.radius) p.y = -p.radius
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: AuroraParticle[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  for (const p of particles) {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
    gradient.addColorStop(0, `${p.color} ${p.opacity})`)
    gradient.addColorStop(1, `${p.color} 0)`)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function AuroraCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    resizeCanvas(canvas)
    const rect = canvas.getBoundingClientRect()
    let particles = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(rect.width, rect.height)
    )
    const time = { value: 0 }
    let animId = 0
    let lastTime = performance.now()

    function loop(now: number) {
      const dt = now - lastTime
      lastTime = now
      const r = canvas!.getBoundingClientRect()
      updateParticles(particles, r.width, r.height, time, dt)
      drawParticles(ctx!, particles, r.width, r.height)
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)

    const onResize = () => {
      resizeCanvas(canvas)
      const r = canvas.getBoundingClientRect()
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(r.width, r.height)
      )
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -10,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
