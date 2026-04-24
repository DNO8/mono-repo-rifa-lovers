import { useCallback, useEffect, useRef, useState } from 'react'
import type { LuckyPassSlot, DrawStep, CustomerDrawResult } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

interface RuletaCanvasProps {
  slots: LuckyPassSlot[]
  currentStep: DrawStep
  winner?: CustomerDrawResult['winners'][0]
}

// Brand colors from design system
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

export function RuletaCanvas({ slots, currentStep, winner }: RuletaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)
  const [canvasSize, setCanvasSize] = useState(400)

  // Responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      if (width < 640) setCanvasSize(320) // Mobile
      else if (width < 1024) setCanvasSize(450) // Tablet
      else setCanvasSize(600) // Desktop (larger than before)
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Calculate responsive font size based on number of slots
  const getFontSize = (slotCount: number, baseSize: number) => {
    if (slotCount <= 5) return baseSize * 0.9
    if (slotCount <= 10) return baseSize * 0.7
    if (slotCount <= 20) return baseSize * 0.5
    if (slotCount <= 50) return baseSize * 0.35
    return baseSize * 0.25
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasSize
    canvas.height = canvasSize

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = canvasSize * 0.48 // Outer edge of pizza
    const innerRadius = canvasSize * 0.12 // Inner hole size

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Get winning slot index - calculate inline to avoid stale closure
      let winningIndex = -1
      if ((currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && slots.length > 0) {
        const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const anglePerSlot = (2 * Math.PI) / slots.length
        const topAngle = (3 * Math.PI) / 2
        const slotIndex = Math.round(((topAngle - normalizedRotation) / anglePerSlot) % slots.length)
        winningIndex = ((slotIndex % slots.length) + slots.length) % slots.length
      }

      if (slots.length === 0) {
        // Draw empty wheel
        ctx.beginPath()
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
        ctx.fillStyle = '#1a1a1a'
        ctx.fill()
        ctx.strokeStyle = '#7B3FE4'
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = '#666'
        ctx.font = `bold ${canvasSize * 0.045}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Esperando participantes...', centerX, centerY)
        
        // Draw center hole
        ctx.beginPath()
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
        ctx.fillStyle = '#0a0a0a'
        ctx.fill()
        ctx.strokeStyle = '#7B3FE4'
        ctx.lineWidth = 2
        ctx.stroke()
        return
      }

      if (currentStep === DRAW_STEP.IDLE) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
        ctx.fillStyle = '#1a1a1a'
        ctx.fill()
        ctx.strokeStyle = '#7B3FE4'
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = `bold ${canvasSize * 0.06}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Presiona', centerX, centerY - 15)
        ctx.font = `bold ${canvasSize * 0.045}px sans-serif`
        ctx.fillStyle = '#FF4DA6'
        ctx.fillText('"Iniciar Sorteo"', centerX, centerY + 15)
        
        // Draw center text FIRST (before center hole so it doesn't get covered)
        if (currentStep === DRAW_STEP.SPINNING) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
          ctx.fillStyle = '#1a1a1a'
          ctx.fill()
          ctx.strokeStyle = '#FF4DA6'
          ctx.lineWidth = 4
          ctx.stroke()

          ctx.fillStyle = '#FF4DA6'
          ctx.font = `bold ${canvasSize * 0.08}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#FF4DA6'
          ctx.shadowBlur = 15
          ctx.fillText('SORTEANDO', centerX, centerY - 10)
          ctx.shadowBlur = 0
          
          ctx.font = `bold ${canvasSize * 0.05}px sans-serif`
          ctx.fillStyle = '#fff'
          ctx.fillText('...', centerX, centerY + 20)
        } else if (currentStep === DRAW_STEP.WATER) {
          ctx.fillStyle = '#00BFFF'
          ctx.font = `bold ${canvasSize * 0.07}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#00BFFF'
          ctx.shadowBlur = 15
          ctx.fillText('AL AGUA', centerX, centerY)
          ctx.shadowBlur = 0
        } else if ((currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner) {
          // Winner announcement in center
          ctx.fillStyle = '#FFD700'
          ctx.font = `bold ${canvasSize * 0.06}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 20
          ctx.fillText('¡GANADOR!', centerX, centerY - 15)
          ctx.shadowBlur = 0
          
          ctx.font = `bold ${canvasSize * 0.04}px sans-serif`
          ctx.fillStyle = '#fff'
          ctx.fillText(`#${winner.passNumber}`, centerX, centerY + 20)
        }
        
        // Draw center hole
        ctx.beginPath()
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
        ctx.fillStyle = '#0a0a0a'
        ctx.fill()
        ctx.strokeStyle = '#7B3FE4'
        ctx.lineWidth = 2
        ctx.stroke()
        return
      }

      if (currentStep === DRAW_STEP.LOADING) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
        ctx.fillStyle = '#1a1a1a'
        ctx.fill()
        ctx.strokeStyle = '#FF4DA6'
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = '#FF4DA6'
        // Draw center hole FIRST
        ctx.beginPath()
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
        ctx.fillStyle = '#0a0a0a'
        ctx.fill()
        ctx.strokeStyle = '#FF4DA6'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw loading text ON TOP of center hole
        ctx.font = `bold ${canvasSize * 0.05}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#FF4DA6'
        ctx.fillText('Cargando...', centerX, centerY)
        return
      }

      // Draw pizza slices
      const angleStep = (2 * Math.PI) / slots.length
      const fontSize = getFontSize(slots.length, canvasSize * 0.06)

      slots.forEach((slot: LuckyPassSlot, index: number) => {
        const startAngle = angleStep * index + rotation - Math.PI / 2
        const endAngle = startAngle + angleStep
        const midAngle = startAngle + angleStep / 2

        // Determine colors
        const isWinnerSlot = index === winningIndex && winner?.luckyPassId === slot.passId
        const baseColor = BRAND_COLORS[index % BRAND_COLORS.length]
        
        // Draw slice
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
        ctx.closePath()
        
        if (isWinnerSlot) {
          ctx.fillStyle = '#FFD700'
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 20
        } else if (index === winningIndex) {
          ctx.fillStyle = '#4a4a4a'
          ctx.shadowBlur = 0
        } else {
          ctx.fillStyle = baseColor + '40' // Add transparency
          ctx.shadowBlur = 0
        }
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw slice border
        ctx.strokeStyle = isWinnerSlot ? '#FFA500' : '#7B3FE4'
        ctx.lineWidth = isWinnerSlot ? 3 : 1
        ctx.stroke()

        // Calculate text position - in the middle of the slice
        const textRadius = (outerRadius + innerRadius) / 2
        const textX = centerX + Math.cos(midAngle) * textRadius
        const textY = centerY + Math.sin(midAngle) * textRadius

        // Draw ticket number - rotated to face center (vertical/radial text)
        ctx.save()
        ctx.translate(textX, textY)
        // Calculate rotation to make text point toward center (radial)
        // Text angle = slice midpoint angle + 90 degrees (PI/2)
        // This makes text perpendicular to the radius, pointing toward center
        let textRotation = midAngle + Math.PI / 2
        // Ensure text is always upright and readable
        // If text would be upside down (left side of wheel), flip it 180 degrees
        if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) {
          textRotation += Math.PI
        }
        ctx.rotate(textRotation)
        
        ctx.fillStyle = isWinnerSlot ? '#000' : '#fff'
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Truncate text if too many slots
        let displayText = `#${slot.passNumber}`
        if (slots.length > 30) {
          displayText = slot.passNumber.toString()
        }
        
        ctx.fillText(displayText, 0, 0)
        ctx.restore()
      })

      // Draw center hole
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
      ctx.fillStyle = '#0a0a0a'
      ctx.fill()
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw center text ON TOP of center hole
      ctx.save()
      // ...winner text drawing code...
      ctx.restore()

      // Draw center text
      if (currentStep === DRAW_STEP.SPINNING) {
        ctx.fillStyle = '#FF4DA6'
        ctx.font = `bold ${canvasSize * 0.08}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#FF4DA6'
        ctx.shadowBlur = 15
        ctx.fillText('SORTEANDO', centerX, centerY - 10)
        ctx.shadowBlur = 0
        
        ctx.font = `bold ${canvasSize * 0.05}px sans-serif`
        ctx.fillStyle = '#fff'
        ctx.fillText('...', centerX, centerY + 20)
      } else if (currentStep === DRAW_STEP.WATER) {
        ctx.fillStyle = '#00BFFF'
        ctx.font = `bold ${canvasSize * 0.07}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#00BFFF'
        ctx.shadowBlur = 15
        ctx.fillText('AL AGUA', centerX, centerY)
        ctx.shadowBlur = 0
      } else if ((currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner) {
      // Draw center hole FIRST (text will be drawn on top of it)
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
      ctx.fillStyle = '#0a0a0a'
      ctx.fill()
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw winner text ON TOP of center hole
      ctx.font = `bold ${canvasSize * 0.05}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#FFD700'
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 20
      ctx.fillText('¡GANADOR!', centerX, centerY - 15)
      ctx.shadowBlur = 0
      
      ctx.font = `bold ${canvasSize * 0.04}px sans-serif`
      ctx.fillStyle = '#fff'
      ctx.fillText(`#${winner.passNumber}`, centerX, centerY + 20)

      // Draw outer ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 4
      ctx.stroke()

      // Draw winner indicator (triangle at top)
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

    const animate = () => {
      if (currentStep === DRAW_STEP.SPINNING) {
        const diff = targetRotation - rotation
        setRotation(prev => prev + diff * 0.08)
      }
      
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [slots, currentStep, rotation, targetRotation, winner, canvasSize])

  // Start spinning when step changes to spinning
  useEffect(() => {
    if (currentStep === DRAW_STEP.SPINNING) {
      const spins = 5 + Math.random() * 3
      const randomAngle = Math.random() * 2 * Math.PI
      const newRotation = rotation + spins * 2 * Math.PI + randomAngle
      
      setTimeout(() => setTargetRotation(newRotation), 100)
    }
  }, [currentStep, rotation])

  return (
    <div ref={containerRef} className="flex flex-col items-center space-y-4 w-full">
      <div className="relative isolate">
        <canvas
          ref={canvasRef}
          className="border-4 border-primary rounded-full shadow-2xl shadow-primary/20 max-w-full relative z-0"
          style={{
            background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        {/* Winner indicator label - z-10 to appear above canvas */}
        {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse z-100">
            GANADOR
          </div>
        )}
      </div>
      
      {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner && (
        <div className="text-center animate-bounce bg-linear-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
             ¡FELICITACIONES! 
          </div>
          <div className="text-xl text-white font-semibold">
            {winner.firstName} {winner.lastName}
          </div>
          <div className="text-lg text-primary font-bold mt-2 bg-white/10 rounded-lg px-4 py-2 inline-block">
            Lucky Pass #{winner.passNumber}
          </div>
          <div className="text-md text-text-secondary mt-2">
            Premio: <span className="text-white font-semibold">{winner.prizeName}</span>
          </div>
        </div>
      )}
      
      {currentStep === DRAW_STEP.FINISHED && (
        <div className="text-center mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
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
