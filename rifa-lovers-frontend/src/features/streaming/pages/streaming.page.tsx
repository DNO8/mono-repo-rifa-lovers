import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Play, Square, RotateCcw, Trophy, Users } from 'lucide-react'
import { RuletaCanvas } from '../components/ruleta-canvas'
import { ParticipantesList } from '../components/participantes-list'
import { GanadoresList } from '../components/ganadores-list'
import { NumeroAguaModal } from '../components/numero-agua-modal'
import { useStreaming } from '@/hooks/use-streaming'
import type { CustomerDrawResult, DrawStep } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

export function StreamingPage() {
  const { raffleId } = useParams<{ raffleId: string }>()
  const { 
    raffle,
    participants,
    luckyPassSlots,
    drawStatus,
    isLoadingRaffle,
    isLoadingDrawStatus,
    executeDraw,
    resetDraw,
  } = useStreaming(raffleId)

  const [currentStep, setCurrentStep] = useState<DrawStep>(DRAW_STEP.IDLE)
  const [currentPrize, setCurrentPrize] = useState(1)
  const [drawResult, setDrawResult] = useState<CustomerDrawResult | null>(null)
  const [showWaterModal, setShowWaterModal] = useState(false)

  // Check if user can draw
  const canDraw = drawStatus?.canExecute ?? false

  const handleStartDraw = async () => {
    if (!canDraw) return
    
    setCurrentStep(DRAW_STEP.LOADING)
    
    try {
      // Cargar participantes en la ruleta
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simular carga
      setCurrentStep(DRAW_STEP.SPINNING)

      // Ejecutar sorteo en el backend
      const result = await executeDraw()
      
      setDrawResult(result)
      setCurrentStep(DRAW_STEP.WINNER)
      
      setCurrentPrize(prev => prev + 1)
      
      // Check if there are more prizes to draw by refetching draw status
      // Small delay to allow backend to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Error en sorteo:', error)
      setCurrentStep(DRAW_STEP.IDLE)
    }
  }

  const handleReset = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de reiniciar el sorteo?\n\nSe eliminarán todos los ganadores y se podrá volver a sortear.'
    )
    if (!confirmed) return

    try {
      await resetDraw()
      setCurrentStep(DRAW_STEP.IDLE)
      setCurrentPrize(1)
      setDrawResult(null)
    } catch (error) {
      console.error('Error reiniciando sorteo:', error)
      alert('Error al reiniciar el sorteo. Intenta nuevamente.')
    }
  }

  if (isLoadingRaffle || isLoadingDrawStatus) {
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
                  {participants.length} participantes • 1 premio
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentStep === DRAW_STEP.IDLE && canDraw && (
                <Button onClick={handleStartDraw} size="lg" className="gap-2">
                  <Play className="size-4" />
                  Iniciar Sorteo Premio {currentPrize}
                </Button>
              )}
              
              {currentStep === DRAW_STEP.IDLE && !canDraw && drawResult && (
                <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 border-red-500 text-red-400 hover:bg-red-500/10">
                  <RotateCcw className="size-4" />
                  Reiniciar Sorteo
                </Button>
              )}
              
              {currentStep === DRAW_STEP.SPINNING && (
                <Button disabled size="lg" variant="ghost" className="gap-2">
                  <Square className="size-4" />
                  Sorteando...
                </Button>
              )}
              
              {(currentStep === DRAW_STEP.WINNER || currentStep === DRAW_STEP.FINISHED) && (
                <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 border-red-500 text-red-400 hover:bg-red-500/10">
                  <RotateCcw className="size-4" />
                  {canDraw ? 'Continuar con Siguiente Premio' : 'Reiniciar Sorteo'}
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
              slots={luckyPassSlots}
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
        participant={null}
        passNumber={null}
      />
    </div>
  )
}

export default StreamingPage
