import { useEffect, useRef, useState } from 'react'
import type { LuckyPassSlot, DrawStep, CustomerDrawResult } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

interface RuletaCanvasProps {
  slots: LuckyPassSlot[]
  currentStep: DrawStep
  winner?: CustomerDrawResult['winners'][0]
}

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

  // Calculate winning slot index based on rotation
  const getWinningSlotIndex = () => {
    if (slots.length === 0) return -1
    // The indicator is at the top (270 degrees or -90 degrees)
    // We need to find which slot is closest to the top
    const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const anglePerSlot = (2 * Math.PI) / slots.length
    // Top position is -PI/2 (or 3PI/2), we need to find the slot at that angle
    const topAngle = (3 * Math.PI) / 2
    const slotIndex = Math.round(((topAngle - normalizedRotation) / anglePerSlot) % slots.length)
    return ((slotIndex % slots.length) + slots.length) % slots.length
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size based on responsive value
    canvas.width = canvasSize
    canvas.height = canvasSize

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvasSize * 0.45 // 45% of canvas size
    const slotRadius = canvasSize * 0.06 // 6% for slot circles

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw outer circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 4
      ctx.stroke()

      // Draw inner circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI)
      ctx.fillStyle = '#1a1a1a'
      ctx.fill()
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 2
      ctx.stroke()

      if (slots.length === 0) {
        ctx.fillStyle = '#666'
        ctx.font = `${canvasSize * 0.04}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Esperando participantes...', centerX, centerY)
        return
      }

      if (currentStep === DRAW_STEP.IDLE) {
        ctx.fillStyle = '#666'
        ctx.font = `bold ${canvasSize * 0.045}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Presiona "Iniciar Sorteo"', centerX, centerY)
        return
      }

      if (currentStep === DRAW_STEP.LOADING) {
        ctx.fillStyle = '#FF4DA6'
        ctx.font = `bold ${canvasSize * 0.045}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Cargando...', centerX, centerY)
        return
      }

      // Get winning slot index
      const winningIndex = currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED
        ? getWinningSlotIndex()
        : -1

      // Draw slots (lucky passes)
      const angleStep = (2 * Math.PI) / slots.length
      
      slots.forEach((slot, index) => {
        const angle = angleStep * index + rotation
        const x = centerX + Math.cos(angle) * (radius - slotRadius - 10)
        const y = centerY + Math.sin(angle) * (radius - slotRadius - 10)

        // Draw slot circle
        ctx.beginPath()
        ctx.arc(x, y, slotRadius, 0, 2 * Math.PI)
        
        // Highlight winner slot
        const isWinnerSlot = index === winningIndex && winner?.luckyPassId === slot.passId
        if (isWinnerSlot) {
          ctx.fillStyle = '#FFD700'
          ctx.strokeStyle = '#FFA500'
          ctx.lineWidth = 4
        } else if (index === winningIndex) {
          ctx.fillStyle = '#4a4a4a'
          ctx.strokeStyle = '#7B3FE4'
          ctx.lineWidth = 2
        } else {
          ctx.fillStyle = '#2a2a2a'
          ctx.strokeStyle = '#7B3FE4'
          ctx.lineWidth = 2
        }
        
        ctx.fill()
        ctx.stroke()

        // Draw ticket number
        ctx.fillStyle = isWinnerSlot ? '#000' : '#fff'
        ctx.font = `bold ${canvasSize * 0.035}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Show ticket number with # prefix
        ctx.fillText(`#${slot.passNumber}`, x, y)
      })

      // Draw center text
      if (currentStep === DRAW_STEP.SPINNING) {
        ctx.fillStyle = '#FF4DA6'
        ctx.font = `bold ${canvasSize * 0.06}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('SORTEANDO', centerX, centerY)
      } else if (currentStep === DRAW_STEP.WATER) {
        ctx.fillStyle = '#00BFFF'
        ctx.font = `bold ${canvasSize * 0.05}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('AL AGUA', centerX, centerY)
      } else if ((currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner) {
        ctx.fillStyle = '#FFD700'
        ctx.font = `bold ${canvasSize * 0.04}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('¡GANADOR!', centerX, centerY)
      }

      // Draw winner indicator (triangle at top)
      ctx.beginPath()
      const indicatorY = centerY - radius - 15
      ctx.moveTo(centerX, indicatorY - 20)
      ctx.lineTo(centerX - 20, indicatorY + 10)
      ctx.lineTo(centerX + 20, indicatorY + 10)
      ctx.closePath()
      ctx.fillStyle = '#FF4444'
      ctx.fill()
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    const animate = () => {
      if (currentStep === DRAW_STEP.SPINNING) {
        // Smooth rotation animation
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
      // Calculate random rotation for dramatic effect
      const spins = 5 + Math.random() * 3 // 5-8 full rotations
      const randomAngle = Math.random() * 2 * Math.PI
      const newRotation = rotation + spins * 2 * Math.PI + randomAngle
      
      setTimeout(() => setTargetRotation(newRotation), 100)
    }
  }, [currentStep, rotation])

  return (
    <div ref={containerRef} className="flex flex-col items-center space-y-4 w-full">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-primary rounded-full shadow-2xl shadow-primary/20 max-w-full"
          style={{
            background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        {/* Winner indicator label */}
        {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            GANADOR
          </div>
        )}
      </div>
      
      {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && winner && (
        <div className="text-center animate-bounce bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400 mb-2">
            🏆 ¡FELICITACIONES! 🏆
          </div>
          <div className="text-lg text-white font-semibold">
            {winner.firstName} {winner.lastName}
          </div>
          <div className="text-md text-primary font-medium mt-1">
            Lucky Pass #{winner.passNumber}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            Premio: {winner.prizeName}
          </div>
        </div>
      )}
      
      {currentStep === DRAW_STEP.FINISHED && (
        <div className="text-center mt-4">
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
