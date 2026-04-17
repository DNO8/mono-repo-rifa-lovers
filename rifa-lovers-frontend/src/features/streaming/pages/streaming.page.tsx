import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Play, Square, RotateCcw, Trophy, Users } from 'lucide-react'
import { RuletaCanvas } from '../components/ruleta-canvas'
import { ParticipantesList } from '../components/participantes-list'
import { GanadoresList } from '../components/ganadores-list'
import { NumeroAguaModal } from '../components/numero-agua-modal'
import { useCustomerRaffle } from '@/hooks/use-customer-raffle'
import { useCustomerDraw } from '@/hooks/use-customer-draw'
import type { CustomerDrawParticipant, CustomerDrawResult, DrawStep } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

export function StreamingPage() {
  const { raffleId } = useParams<{ raffleId: string }>()
  const { raffle, isLoading: isLoadingRaffle } = useCustomerRaffle(raffleId!)
  const { 
    availability, 
    isLoading: isLoadingAvailability,
    checkAvailability,
    executeDraw 
  } = useCustomerDraw(raffleId!)

  const [currentStep, setCurrentStep] = useState<DrawStep>(DRAW_STEP.IDLE)
  const [participants, setParticipants] = useState<CustomerDrawParticipant[]>([])
  const [currentPrize, setCurrentPrize] = useState(1)
  const [drawResult, setDrawResult] = useState<CustomerDrawResult | null>(null)
  const [showWaterModal, setShowWaterModal] = useState(false)
  const [waterInfo, setWaterInfo] = useState<{ participant: CustomerDrawParticipant; passNumber: number } | null>(null)

  // Cargar disponibilidad inicial
  useEffect(() => {
    if (raffleId) {
      checkAvailability()
    }
  }, [raffleId, checkAvailability])

  // Actualizar participantes cuando cambia la disponibilidad
  useEffect(() => {
    if (availability?.participants) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setParticipants(availability.participants), 0)
    }
  }, [availability])

  const handleStartDraw = async () => {
    if (!availability?.canDraw) return
    
    setCurrentStep(DRAW_STEP.LOADING)
    
    try {
      // Cargar participantes en la ruleta
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simular carga
      setCurrentStep(DRAW_STEP.SPINNING)
      
      // Simular animación de ruleta
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Ejecutar sorteo real
      const result = await executeDraw()
      setDrawResult(result)
      
      // Mostrar números al agua (simulado)
      if (result.discarded.length > 0) {
        for (const discarded of result.discarded.slice(0, 2)) {
          const participant = participants.find(p => p.userId === discarded.userId)
          if (participant) {
            setWaterInfo({ participant, passNumber: discarded.passNumber })
            setShowWaterModal(true)
            setCurrentStep(DRAW_STEP.WATER)
            await new Promise(resolve => setTimeout(resolve, 3000))
            setShowWaterModal(false)
          }
        }
      }
      
      // Mostrar ganador
      setCurrentStep(DRAW_STEP.WINNER)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Si hay más premios, continuar
      if (currentPrize < availability.prizesCount) {
        setCurrentPrize(currentPrize + 1)
        setCurrentStep(DRAW_STEP.IDLE)
        // Filtrar participantes para remover ganador
        const winner = result.winners[0]
        setParticipants(prev => prev.filter(p => p.userId !== winner.userId))
      } else {
        setCurrentStep(DRAW_STEP.FINISHED)
      }
      
    } catch (error) {
      console.error('Error en sorteo:', error)
      setCurrentStep(DRAW_STEP.IDLE)
    }
  }

  const handleReset = () => {
    setCurrentStep(DRAW_STEP.IDLE)
    setCurrentPrize(1)
    setDrawResult(null)
    setParticipants(availability?.participants || [])
    checkAvailability()
  }

  if (isLoadingRaffle || isLoadingAvailability) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-white">Rifa no encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white">
      {/* Header */}
      <header className="border-b border-border bg-bg-dark/95 supports-backdrop-filter:bg-bg-dark/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{raffle.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={raffle.status === 'closed' ? 'outline-primary' : 'subtle'}>
                  {raffle.status === 'closed' ? 'Lista para sorteo' : raffle.status}
                </Badge>
                <span className="text-sm text-text-secondary">
                  {participants.length} participantes • {availability?.prizesCount || 0} premios
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentStep === DRAW_STEP.IDLE && availability?.canDraw && (
                <Button onClick={handleStartDraw} size="lg" className="gap-2">
                  <Play className="size-4" />
                  Iniciar Premio {currentPrize}
                </Button>
              )}
              
              {currentStep === DRAW_STEP.SPINNING && (
                <Button disabled size="lg" variant="ghost" className="gap-2">
                  <Square className="size-4" />
                  Sorteando...
                </Button>
              )}
              
              {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && (
                <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="size-4" />
                  Reiniciar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 h-[calc(100vh-120px)]">
          
          {/* Aside Izquierdo - Participantes */}
          <aside className="space-y-4">
            <Card className="p-4 bg-bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Users className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">Participantes</h2>
                <Badge variant="subtle">{participants.length}</Badge>
              </div>
              <ParticipantesList 
                participants={participants}
                winners={drawResult?.winners || []}
                discarded={drawResult?.discarded || []}
              />
            </Card>
          </aside>

          {/* Centro - Ruleta */}
          <section className="flex items-center justify-center">
            <RuletaCanvas
              participants={participants}
              currentStep={currentStep}
              winner={drawResult?.winners[0]}
            />
          </section>

          {/* Aside Derecho - Ganadores */}
          <aside className="space-y-4">
            <Card className="p-4 bg-bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="size-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Ganadores</h2>
                <Badge variant="subtle">{drawResult?.winners.length || 0}</Badge>
              </div>
              <GanadoresList winners={drawResult?.winners || []} />
            </Card>
          </aside>
        </div>
      </main>

      {/* Modal Número al Agua */}
      <NumeroAguaModal
        isOpen={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        participant={waterInfo?.participant}
        passNumber={waterInfo?.passNumber}
      />
    </div>
  )
}

export default StreamingPage
