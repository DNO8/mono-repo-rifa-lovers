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
  '#7B3FE4', // Primary purple
  '#FF4DA6', // Secondary pink
  '#FF8A3D', // Tertiary orange
  '#00C9A7', // Teal
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#14B8A6', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
]

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

  // All animation state lives in refs — no React state for rotation
  const rotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const winningIndexRef = useRef(-1)
  const currentStepRef = useRef(currentStep)
  const winnerRef = useRef(winner)
  const slotsRef = useRef(slots)
  const canvasSizeRef = useRef(canvasSize)

  // Keep refs in sync with latest props (useLayoutEffect: safe, runs after render, before paint)
  useLayoutEffect(() => {
    currentStepRef.current = currentStep
    winnerRef.current = winner
    slotsRef.current = slots
    canvasSizeRef.current = canvasSize
  })

  // Responsive canvas size
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

  // Configure spin target when SPINNING begins
  useEffect(() => {
    if (currentStep !== DRAW_STEP.SPINNING || slots.length === 0) return

    const anglePerSlot = (2 * Math.PI) / slots.length
    const spins = 6 + Math.random() * 4 // 6-10 full rotations

    let finalAngle: number

    if (targetSlot) {
      const slotIndex = slots.findIndex(s => s.passId === targetSlot.passId)
      if (slotIndex >= 0) {
        winningIndexRef.current = slotIndex
        // Center of slot[slotIndex] must align with the top pointer at -π/2.
        // Slice center in canvas coords = rotation + slotIndex*step + step/2 - π/2
        // Setting that equal to -π/2 gives: rotation = -(slotIndex + 0.5)*step
        // finalAngle is the rotation value modulo 2π (positive)
        const slotCenter = anglePerSlot * (slotIndex + 0.5)
        finalAngle = ((-slotCenter) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
      } else {
        finalAngle = Math.random() * 2 * Math.PI
      }
    } else {
      winningIndexRef.current = -1
      finalAngle = Math.random() * 2 * Math.PI
    }

    // Reset rotation so the spin is always long regardless of history
    rotationRef.current = 0
    targetRotationRef.current = spins * 2 * Math.PI + finalAngle
  }, [currentStep, slots, targetSlot])

  // Reset winningIndex when returning to idle (new draw cycle)
  useEffect(() => {
    if (currentStep === DRAW_STEP.IDLE) {
      winningIndexRef.current = -1
      rotationRef.current = 0
      targetRotationRef.current = 0
    }
  }, [currentStep])

  // Single RAF loop — reads from refs, never causes re-renders
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

      // Resize canvas if needed
      if (canvas.width !== size) {
        canvas.width = size
        canvas.height = size
      }

      const w = canvas.width
      const h = canvas.height
      const centerX = w / 2
      const centerY = h / 2
      const outerRadius = size * 0.48
      const innerRadius = size * 0.12

      // Advance spin easing
      if (step === DRAW_STEP.SPINNING) {
        const diff = targetRotationRef.current - rotationRef.current
        rotationRef.current += diff * 0.04
      }

      const rotation = rotationRef.current

      ctx.clearRect(0, 0, w, h)

      // Outer ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
      ctx.fillStyle = '#1a1a1a'
      ctx.fill()
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 4
      ctx.stroke()

      // Empty state
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

      // Idle / Loading static screens
      if (step === DRAW_STEP.IDLE) {
        drawCenterHole(ctx, centerX, centerY, innerRadius)
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${size * 0.06}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Presiona', centerX, centerY - 15)
        ctx.font = `bold ${size * 0.045}px sans-serif`
        ctx.fillStyle = '#FF4DA6'
        ctx.fillText('"Iniciar Sorteo"', centerX, centerY + 15)
        rafRef.current = requestAnimationFrame(renderFrame)
        return
      }

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

      // Winning index
      const winningIndex = (step === DRAW_STEP.WINNER || step === DRAW_STEP.FINISHED)
        ? winningIndexRef.current
        : -1

      // Draw slices
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
        } else if (index === winningIndex && step !== DRAW_STEP.SPINNING) {
          ctx.fillStyle = '#4a4a4a'
          ctx.shadowBlur = 0
        } else {
          ctx.fillStyle = baseColor + '40'
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
        if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) {
          textRotation += Math.PI
        }
        ctx.rotate(textRotation)
        ctx.fillStyle = isWinnerSlot ? '#000' : '#fff'
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(theSlots.length > 30 ? slot.passNumber.toString() : `#${slot.passNumber}`, 0, 0)
        ctx.restore()
      })

      drawCenterHole(ctx, centerX, centerY, innerRadius)

      // Center overlay text
      if (step === DRAW_STEP.SPINNING) {
        ctx.fillStyle = '#FF4DA6'
        ctx.font = `bold ${size * 0.08}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#FF4DA6'
        ctx.shadowBlur = 15
        ctx.fillText('SORTEANDO', centerX, centerY - 10)
        ctx.shadowBlur = 0
        ctx.font = `bold ${size * 0.05}px sans-serif`
        ctx.fillStyle = '#fff'
        ctx.fillText('...', centerX, centerY + 20)
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
        ctx.font = `bold ${size * 0.05}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#FFD700'
        ctx.shadowBlur = 20
        ctx.fillText('¡GANADOR!', centerX, centerY - 15)
        ctx.shadowBlur = 0
        ctx.font = `bold ${size * 0.04}px sans-serif`
        ctx.fillStyle = '#fff'
        ctx.fillText(`#${theWinner.passNumber}`, centerX, centerY + 20)

        ctx.beginPath()
        const indicatorY = centerY - outerRadius - 15
        ctx.moveTo(centerX, indicatorY - 25)
        ctx.lineTo(centerX - 15, indicatorY + 5)
        ctx.lineTo(centerX + 15, indicatorY + 5)
        ctx.closePath()
        ctx.fillStyle = '#FF4444'
        ctx.fill()
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(renderFrame)
    }

    canvas.width = canvasSize
    canvas.height = canvasSize
    rafRef.current = requestAnimationFrame(renderFrame)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // Only restart the loop when canvas size changes (everything else reads from refs)
  }, [canvasSize])

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="relative isolate">
        <canvas
          ref={canvasRef}
          className="border-4 border-primary rounded-full shadow-2xl shadow-primary/20 max-w-full"
          style={{
            background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse z-10">
            GANADOR
          </div>
        )}
      </div>

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
        <div className="text-center mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 w-full max-w-sm">
          <div className="text-2xl font-bold text-green-400 mb-2">
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
