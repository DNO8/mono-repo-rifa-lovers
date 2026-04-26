import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { LuckyPassSlot, DrawStep, CustomerDrawResult } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

interface RuletaCanvasProps {
  slots: LuckyPassSlot[]
  currentStep: DrawStep
  winner?: CustomerDrawResult['winners'][0]
  targetSlot?: LuckyPassSlot | null
}

const BRAND_COLORS = [
  '#7B3FE4',
  '#FF4DA6',
  '#FF8A3D',
  '#00C9A7',
  '#6366F1',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F59E0B',
  '#3B82F6',
]

// Constant angular velocity for the free-spin phase (radians per frame at 60fps)
const FREE_SPIN_SPEED = 0.12
// Duration of the easing deceleration phase in milliseconds
const EASING_ANIM_MS = 5000

// easeOutQuart: fast start, long smooth tail — ideal for roulette deceleration
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

function getFontSize(slotCount: number, baseSize: number) {
  if (slotCount <= 5) return baseSize * 0.9
  if (slotCount <= 10) return baseSize * 0.7
  if (slotCount <= 20) return baseSize * 0.5
  if (slotCount <= 50) return baseSize * 0.35
  return baseSize * 0.25
}

function drawCenterHole(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = '#0a0a0a'
  ctx.fill()
  ctx.strokeStyle = '#7B3FE4'
  ctx.lineWidth = 3
  ctx.stroke()
}

export function RuletaCanvas({ slots, currentStep, winner, targetSlot }: RuletaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [canvasSize, setCanvasSize] = useState(400)

  // ── Animation state (all in refs, no React state) ───────────────────────────
  const rotationRef = useRef(0)
  // Phase control: 'free' = constant speed, 'easing' = decelerating to target
  const spinPhaseRef = useRef<'free' | 'easing'>('free')
  const targetRotationRef = useRef(0)
  const winningIndexRef = useRef(-1)
  // Flag: target has been calculated once — prevents recalculation mid-easing
  const targetCalculatedRef = useRef(false)
  // Time-based easing tracking
  const easingStartTimeRef = useRef(0)
  const easingStartRotationRef = useRef(0)
  const easingTotalDistanceRef = useRef(0)

  // ── Prop mirrors (updated after every render via useLayoutEffect) ────────────
  const currentStepRef = useRef(currentStep)
  const winnerRef = useRef(winner)
  const slotsRef = useRef(slots)
  const targetSlotRef = useRef(targetSlot)
  const canvasSizeRef = useRef(canvasSize)

  useLayoutEffect(() => {
    currentStepRef.current = currentStep
    winnerRef.current = winner
    slotsRef.current = slots
    targetSlotRef.current = targetSlot
    canvasSizeRef.current = canvasSize
  })

  // ── Responsive canvas size ───────────────────────────────────────────────────
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      if (width < 640) setCanvasSize(320)
      else if (width < 1024) setCanvasSize(450)
      else setCanvasSize(600)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // ── Reset animation state when IDLE (new draw cycle) ────────────────────────
  useEffect(() => {
    if (currentStep === DRAW_STEP.IDLE) {
      rotationRef.current = 0
      spinPhaseRef.current = 'free'
      targetRotationRef.current = 0
      winningIndexRef.current = -1
      targetCalculatedRef.current = false
      easingStartTimeRef.current = 0
      easingStartRotationRef.current = 0
      easingTotalDistanceRef.current = 0
    }
  }, [currentStep])

  // ── Transition to free-spin when SPINNING starts ────────────────────────────
  // NOTE: we do NOT calculate the target here. The RAF loop checks for targetSlot
  // on every frame and transitions to 'easing' phase when it first appears.
  // This avoids the double-fire bug (useEffect re-running when targetSlot arrives).
  useEffect(() => {
    if (currentStep === DRAW_STEP.SPINNING) {
      spinPhaseRef.current = 'free'
      targetCalculatedRef.current = false
      winningIndexRef.current = -1
      // Do NOT reset rotation here — keep any current rotation so the wheel looks live
    }
  }, [currentStep])

  // ── Single persistent RAF loop ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderFrame = () => {
      const step = currentStepRef.current
      const theSlots = slotsRef.current
      const theWinner = winnerRef.current
      const size = canvasSizeRef.current
      const theTargetSlot = targetSlotRef.current

      // Resize canvas backing store if needed
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }

      const w = canvas.width
      const centerX = w / 2
      const centerY = w / 2
      const outerRadius = size * 0.46
      const innerRadius = size * 0.12

      // ── Advance rotation ─────────────────────────────────────────────────────
      if (step === DRAW_STEP.SPINNING) {
        if (spinPhaseRef.current === 'free') {
          // Phase 1: constant velocity — keep spinning until target arrives
          rotationRef.current += FREE_SPIN_SPEED

          // Transition to easing phase the moment a targetSlot is available
          if (theTargetSlot && !targetCalculatedRef.current && theSlots.length > 0) {
            targetCalculatedRef.current = true
            const slotIndex = theSlots.findIndex(s => s.passId === theTargetSlot.passId)
            if (slotIndex >= 0) {
              winningIndexRef.current = slotIndex
              const anglePerSlot = (2 * Math.PI) / theSlots.length
              // Desired final rotation: center of winning slice is under the top pointer
              // Slice center at rotation R = R + slotIndex*step + step/2 - π/2 (canvas draw offset)
              // We want that to equal -π/2 (top), so R = -(slotIndex + 0.5)*step  (mod 2π, positive)
              const slotCenter = anglePerSlot * (slotIndex + 0.5)
              const baseAngle = ((-slotCenter) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)

              // From current rotation, add 4 extra full rotations so deceleration is clearly visible
              const currentNorm = ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
              let extraArc = baseAngle - currentNorm
              if (extraArc <= 0) extraArc += 2 * Math.PI
              targetRotationRef.current = rotationRef.current + extraArc + 4 * 2 * Math.PI
            } else {
              targetRotationRef.current = rotationRef.current + 4 * 2 * Math.PI
            }
            // Snapshot the easing start state for time-based interpolation
            easingStartTimeRef.current = performance.now()
            easingStartRotationRef.current = rotationRef.current
            easingTotalDistanceRef.current = targetRotationRef.current - rotationRef.current
            spinPhaseRef.current = 'easing'
          }
        } else {
          // Phase 2: time-based easeOutQuart deceleration
          const elapsed = performance.now() - easingStartTimeRef.current
          const t = Math.min(elapsed / EASING_ANIM_MS, 1)
          rotationRef.current = easingStartRotationRef.current + easingTotalDistanceRef.current * easeOutQuart(t)
          // Snap to exact target when animation is complete
          if (t >= 1) {
            rotationRef.current = targetRotationRef.current
          }
        }
      }

      const rotation = rotationRef.current

      ctx.clearRect(0, 0, w, w)

      // ── Outer ring ───────────────────────────────────────────────────────────
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
      ctx.fillStyle = '#1a1a1a'
      ctx.fill()
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 4
      ctx.stroke()

      // ── Empty state ──────────────────────────────────────────────────────────
      if (theSlots.length === 0) {
        ctx.fillStyle = '#666'
        ctx.font = `bold ${size * 0.045}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Esperando participantes...', centerX, centerY)
        drawCenterHole(ctx, centerX, centerY, innerRadius)
        rafRef.current = requestAnimationFrame(renderFrame)
        return
      }

      // ── IDLE screen ──────────────────────────────────────────────────────────
      if (step === DRAW_STEP.IDLE) {
        drawCenterHole(ctx, centerX, centerY, innerRadius)
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${size * 0.055}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Presiona', centerX, centerY - 14)
        ctx.font = `bold ${size * 0.04}px sans-serif`
        ctx.fillStyle = '#FF4DA6'
        ctx.fillText('"Iniciar Sorteo"', centerX, centerY + 14)
        rafRef.current = requestAnimationFrame(renderFrame)
        return
      }

      // ── LOADING screen ───────────────────────────────────────────────────────
      if (step === DRAW_STEP.LOADING) {
        drawCenterHole(ctx, centerX, centerY, innerRadius)
        ctx.fillStyle = '#FF4DA6'
        ctx.font = `bold ${size * 0.05}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Cargando...', centerX, centerY)
        rafRef.current = requestAnimationFrame(renderFrame)
        return
      }

      // ── Winning index (only highlight in WINNER/FINISHED) ───────────────────
      const winningIndex = (step === DRAW_STEP.WINNER || step === DRAW_STEP.FINISHED)
        ? winningIndexRef.current
        : -1

      // ── Draw pizza slices ────────────────────────────────────────────────────
      const angleStep = (2 * Math.PI) / theSlots.length
      const fontSize = getFontSize(theSlots.length, size * 0.06)

      theSlots.forEach((slot, index) => {
        const startAngle = angleStep * index + rotation - Math.PI / 2
        const endAngle = startAngle + angleStep
        const midAngle = startAngle + angleStep / 2
        const isWinnerSlot = index === winningIndex && theWinner?.luckyPassId === slot.passId
        const baseColor = BRAND_COLORS[index % BRAND_COLORS.length]

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
        ctx.closePath()

        if (isWinnerSlot) {
          ctx.fillStyle = '#FFD700'
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 20
        } else if (index === winningIndex) {
          ctx.fillStyle = '#3a3a3a'
          ctx.shadowBlur = 0
        } else {
          ctx.fillStyle = baseColor + '55'
          ctx.shadowBlur = 0
        }
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = isWinnerSlot ? '#FFA500' : '#7B3FE4'
        ctx.lineWidth = isWinnerSlot ? 3 : 1
        ctx.stroke()

        const textRadius = (outerRadius + innerRadius) / 2
        const textX = centerX + Math.cos(midAngle) * textRadius
        const textY = centerY + Math.sin(midAngle) * textRadius

        ctx.save()
        ctx.translate(textX, textY)
        let textRotation = midAngle
        if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) textRotation += Math.PI
        ctx.rotate(textRotation)
        ctx.fillStyle = isWinnerSlot ? '#000' : '#fff'
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(theSlots.length > 30 ? slot.passNumber.toString() : `#${slot.passNumber}`, 0, 0)
        ctx.restore()
      })

      // ── Center hole ──────────────────────────────────────────────────────────
      drawCenterHole(ctx, centerX, centerY, innerRadius)

      // ── Center overlay text ──────────────────────────────────────────────────
      if (step === DRAW_STEP.SPINNING) {
        // During free-spin phase show "..." waiting for backend
        // During easing phase show "SORTEANDO"
        const label = spinPhaseRef.current === 'easing' ? 'SORTEANDO' : '...'
        ctx.fillStyle = '#FF4DA6'
        ctx.font = `bold ${size * 0.075}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#FF4DA6'
        ctx.shadowBlur = 15
        ctx.fillText(label, centerX, centerY)
        ctx.shadowBlur = 0
      } else if (step === DRAW_STEP.WATER) {
        ctx.fillStyle = '#00BFFF'
        ctx.font = `bold ${size * 0.07}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#00BFFF'
        ctx.shadowBlur = 15
        ctx.fillText('AL AGUA', centerX, centerY)
        ctx.shadowBlur = 0
      } else if ((step === DRAW_STEP.WINNER || step === DRAW_STEP.FINISHED) && theWinner) {
        ctx.fillStyle = '#FFD700'
        ctx.font = `bold ${size * 0.055}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#FFD700'
        ctx.shadowBlur = 20
        ctx.fillText('¡GANADOR!', centerX, centerY - 16)
        ctx.shadowBlur = 0
        ctx.font = `bold ${size * 0.045}px sans-serif`
        ctx.fillStyle = '#fff'
        ctx.fillText(`#${theWinner.passNumber}`, centerX, centerY + 20)
      }

      rafRef.current = requestAnimationFrame(renderFrame)
    }

    canvas.width = canvasSize
    canvas.height = canvasSize
    rafRef.current = requestAnimationFrame(renderFrame)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [canvasSize])

  const isSpinningOrDone =
    currentStep === DRAW_STEP.SPINNING ||
    currentStep === DRAW_STEP.WINNER ||
    currentStep === DRAW_STEP.FINISHED

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Wheel + fixed TV-style pointer rendered in HTML above canvas */}
      <div className="relative flex items-center justify-center" style={{ width: canvasSize, maxWidth: '100%' }}>
        {/* Fixed top pointer — always visible when wheel is active */}
        {isSpinningOrDone && (
          <div
            className="absolute z-10 left-1/2 -translate-x-1/2"
            style={{ top: -4 }}
          >
            {/* Triangle pointing downward */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '22px solid #FF4444',
                filter: 'drop-shadow(0 0 6px #FFD700)',
              }}
            />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="border-4 border-primary rounded-full shadow-2xl shadow-primary/20"
          style={{
            background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* Congrats card */}
      {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner && (
        <div className="text-center bg-linear-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6 shadow-lg w-full max-w-sm">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            ¡FELICITACIONES!
          </div>
          <div className="text-xl text-white font-semibold">
            {winner.firstName} {winner.lastName}
          </div>
          <div className="text-lg text-yellow-300 font-bold mt-2 bg-white/10 rounded-lg px-4 py-2 inline-block">
            Lucky Pass #{winner.passNumber}
          </div>
          <div className="text-sm text-text-secondary mt-2">
            Premio: <span className="text-white font-semibold">{winner.prizeName}</span>
          </div>
        </div>
      )}

      {currentStep === DRAW_STEP.FINISHED && (
        <div className="text-center mt-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4 w-full max-w-sm">
          <div className="text-2xl font-bold text-green-400 mb-1">
            ✅ Sorteo Completado
          </div>
          <div className="text-sm text-text-secondary">
            Todos los premios han sido asignados
          </div>
        </div>
      )}
    </div>
  )
}
