import { useEffect, useRef, useState } from 'react'
import type { CustomerDrawParticipant, DrawStep } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

interface RuletaCanvasProps {
  participants: CustomerDrawParticipant[]
  currentStep: DrawStep
  winner?: {
    userId: string
    email: string | null
    firstName: string | null
    lastName: string | null
    prizeName: string
  }
}

export function RuletaCanvas({ participants, currentStep, winner }: RuletaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 400

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 180

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
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
      ctx.fillStyle = '#1a1a1a'
      ctx.fill()
      ctx.strokeStyle = '#7B3FE4'
      ctx.lineWidth = 2
      ctx.stroke()

      if (participants.length === 0) {
        // Draw empty state
        ctx.fillStyle = '#666'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Esperando participantes...', centerX, centerY)
        return
      }

      if (currentStep === DRAW_STEP.IDLE) {
        // Draw waiting state
        ctx.fillStyle = '#666'
        ctx.font = '18px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Presiona "Iniciar Sorteo"', centerX, centerY)
        return
      }

      if (currentStep === DRAW_STEP.LOADING) {
        // Draw loading state
        ctx.fillStyle = '#FF4DA6'
        ctx.font = '18px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Cargando participantes...', centerX, centerY)
        return
      }

      // Draw participants
      const angleStep = (2 * Math.PI) / participants.length
      
      participants.forEach((participant, index) => {
        const angle = angleStep * index + rotation
        const x = centerX + Math.cos(angle) * (radius - 40)
        const y = centerY + Math.sin(angle) * (radius - 40)

        // Draw participant circle
        ctx.beginPath()
        ctx.arc(x, y, 25, 0, 2 * Math.PI)
        
        // Highlight winner
        if (currentStep === DRAW_STEP.WINNER && winner?.userId === participant.userId) {
          ctx.fillStyle = '#FFD700'
          ctx.strokeStyle = '#FFA500'
          ctx.lineWidth = 3
        } else {
          ctx.fillStyle = '#2a2a2a'
          ctx.strokeStyle = '#7B3FE4'
          ctx.lineWidth = 2
        }
        
        ctx.fill()
        ctx.stroke()

        // Draw participant initials
        ctx.fillStyle = currentStep === 'winner' && winner?.userId === participant.userId ? '#000' : '#fff'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const initials = participant.firstName && participant.lastName 
          ? `${participant.firstName[0]}${participant.lastName[0]}`.toUpperCase()
          : participant.firstName?.[0]?.toUpperCase() || participant.email?.[0]?.toUpperCase() || '?'
        
        ctx.fillText(initials, x, y)
      })

      // Draw center text
      if (currentStep === DRAW_STEP.SPINNING) {
        ctx.fillStyle = '#FF4DA6'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('SORTEANDO', centerX, centerY)
      } else if (currentStep === DRAW_STEP.WATER) {
        ctx.fillStyle = '#00BFFF'
        ctx.font = 'bold 18px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('AL AGUA', centerX, centerY)
      } else if (currentStep === DRAW_STEP.WINNER && winner) {
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('¡GANADOR!', centerX, centerY)
      }
    }

    const animate = () => {
      if (currentStep === DRAW_STEP.SPINNING) {
        // Smooth rotation animation
        const diff = targetRotation - rotation
        setRotation(prev => prev + diff * 0.1)
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
  }, [participants, currentStep, rotation, targetRotation, winner])

  // Start spinning when step changes to spinning
  useEffect(() => {
    if (currentStep === DRAW_STEP.SPINNING) {
      // Calculate random rotation for dramatic effect
      const spins = 5 + Math.random() * 3 // 5-8 full rotations
      const randomAngle = Math.random() * 2 * Math.PI
      const newRotation = rotation + spins * 2 * Math.PI + randomAngle
      
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setTargetRotation(newRotation), 0)
    }
  }, [currentStep, rotation])

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-primary rounded-full shadow-2xl shadow-primary/20"
        style={{
          background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
        }}
      />
      
      {currentStep === DRAW_STEP.WINNER && winner && (
        <div className="text-center animate-bounce">
          <div className="text-2xl font-bold text-yellow-400 mb-2">
            🏆 ¡FELICITACIONES! 🏆
          </div>
          <div className="text-lg text-white">
            {winner.firstName} {winner.lastName}
          </div>
          <div className="text-sm text-text-secondary">
            Premio: {winner.prizeName}
          </div>
        </div>
      )}
      
      {currentStep === DRAW_STEP.FINISHED && (
        <div className="text-center">
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
