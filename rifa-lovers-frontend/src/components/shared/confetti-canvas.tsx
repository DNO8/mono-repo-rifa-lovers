import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react'

interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
}

const COLORS = ['#7B3FE4', '#FF4DA6', '#FF8A3D', '#22C55E', '#3B82F6', '#FFFFFF']
const GRAVITY = 0.12
const DAMPING = 0.98
const PARTICLE_COUNT = 150

export interface ConfettiRef {
  fire: (originX?: number, originY?: number) => void
}

function createConfettiParticle(x: number, y: number): ConfettiParticle {
  const angle = Math.random() * Math.PI * 2
  const speed = 4 + Math.random() * 8
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 6,
    size: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    life: 0,
    maxLife: 80 + Math.random() * 60,
  }
}

function resizeConfettiCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function updateConfetti(particles: ConfettiParticle[]): ConfettiParticle[] {
  const alive: ConfettiParticle[] = []
  for (const p of particles) {
    p.vy += GRAVITY
    p.vx *= DAMPING
    p.vy *= DAMPING
    p.x += p.vx
    p.y += p.vy
    p.rotation += p.rotationSpeed
    p.life++
    if (p.life < p.maxLife) alive.push(p)
  }
  return alive
}

function drawConfetti(ctx: CanvasRenderingContext2D, particles: ConfettiParticle[]) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate((p.rotation * Math.PI) / 180)
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
    ctx.restore()
  }
}

interface ConfettiState {
  particles: ConfettiParticle[]
  animId: number
  running: boolean
}

export const ConfettiCanvas = forwardRef<ConfettiRef, { className?: string }>(
  ({ className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const stateRef = useRef<ConfettiState>({ particles: [], animId: 0, running: false })

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      resizeConfettiCanvas(canvas)
      const s = stateRef.current
      const onResize = () => resizeConfettiCanvas(canvas)
      window.addEventListener('resize', onResize)
      return () => {
        cancelAnimationFrame(s.animId)
        window.removeEventListener('resize', onResize)
      }
    }, [])

    useImperativeHandle(ref, () => ({
      fire(originX?: number, originY?: number) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const x = originX ?? window.innerWidth / 2
        const y = originY ?? window.innerHeight / 2
        const s = stateRef.current

        resizeConfettiCanvas(canvas)
        const newParticles = Array.from({ length: PARTICLE_COUNT }, () =>
          createConfettiParticle(x, y)
        )
        s.particles = [...s.particles, ...newParticles]

        if (!s.running) {
          s.running = true
          const loop = () => {
            s.particles = updateConfetti(s.particles)
            drawConfetti(ctx!, s.particles)
            if (s.particles.length === 0) {
              s.running = false
              ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight)
              return
            }
            s.animId = requestAnimationFrame(loop)
          }
          s.animId = requestAnimationFrame(loop)
        }
      },
    }), [])

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 100,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    )
  }
)
ConfettiCanvas.displayName = 'ConfettiCanvas'
