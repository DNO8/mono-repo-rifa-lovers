import { useParams } from 'react-router-dom'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Play, RotateCcw, Trophy, Users } from 'lucide-react'
import { RuletaCanvas } from '../components/ruleta-canvas'
import { ParticipantesList } from '../components/participantes-list'
import { GanadoresList } from '../components/ganadores-list'
import { ResetConfirmModal } from '../components/reset-confirm-modal'
import { useStreaming } from '@/hooks/use-streaming'
import { useLuckyPasses } from '@/hooks/use-lucky-passes'
import { WinnersDropdown } from '@/features/admin/components/winners-dropdown'
import type { CustomerDrawResult, DrawStep, LuckyPassSlot } from '@/types/streaming.types'
import { DRAW_STEP } from '@/types/streaming.types'

type DrawWinner = CustomerDrawResult['winners'][number]

// Animation constants
const LOADING_DURATION = 1500
// How long the wheel free-spins while the API call is in-flight
const MIN_SPIN_DURATION = 4000
// Must match EASING_ANIM_MS in ruleta-canvas.tsx (5000ms) + small margin
const EASING_DURATION = 5300

export function StreamingPage() {
  const { raffleId } = useParams<{ raffleId: string }>()
  const { 
    raffle, 
    participants, 
    luckyPassSlots,
    isLoadingRaffle,
    isLoadingDrawStatus,
    drawStatus,
    executeDraw,
    resetDraw,
    refreshDrawStatus,
  } = useStreaming(raffleId!)
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<DrawStep>(DRAW_STEP.IDLE)
  const [allWinners, setAllWinners] = useState<DrawWinner[]>([])
  const [lastWinner, setLastWinner] = useState<DrawWinner | null>(null)
  const [targetWinnerSlot, setTargetWinnerSlot] = useState<LuckyPassSlot | null>(null)
  
  // Ref to prevent double-trigger
  const isDrawingRef = useRef(false)

  const { refresh: refreshMyPasses } = useLuckyPasses()

  // Calculate current prize number based on existing winners
  const currentPrize = (drawStatus?.winnersCount ?? 0) + 1
  const totalPrizes = drawStatus?.prizesCount ?? 1
  
  // Check if user can draw
  const canDraw = drawStatus?.canDraw ?? false

  const handleStartDraw = async () => {
    if (!canDraw || isDrawingRef.current) return
    
    isDrawingRef.current = true
    setCurrentStep(DRAW_STEP.LOADING)
    
    try {
      // Step 1: Loading phase
      await new Promise(resolve => setTimeout(resolve, LOADING_DURATION))
      
      // Step 2: Start spinning animation and execute draw in parallel
      setCurrentStep(DRAW_STEP.SPINNING)
      
      // Execute draw in background while the wheel free-spins
      const drawPromise = executeDraw()
      
      // Ensure the wheel free-spins for at least MIN_SPIN_DURATION before easing
      const minSpinPromise = new Promise(resolve => setTimeout(resolve, MIN_SPIN_DURATION))
      
      // Get result and wait for minimum free-spin time
      const [result] = await Promise.all([drawPromise, minSpinPromise])
      
      // Find the winning slot and hand it to the canvas (triggers easing phase).
      // ONLY setTargetWinnerSlot here — do NOT update winner state yet.
      // The aside and congrats card must stay hidden until the wheel stops.
      const winnerSlot = luckyPassSlots.find(slot => 
        slot.passNumber === result.winners[0]?.passNumber
      ) || null
      const newWinner = result.winners[0] ?? null

      setTargetWinnerSlot(winnerSlot)

      // Wait for the easing animation to fully complete (wheel stopped on winner slot)
      await new Promise(resolve => setTimeout(resolve, EASING_DURATION))

      // NOW reveal winner — wheel is stopped, slice is highlighted
      setLastWinner(newWinner)
      if (newWinner) {
        setAllWinners(prev => [...prev, newWinner])
      }
      setCurrentStep(DRAW_STEP.WINNER)
      
      // Refresh draw status to get updated counts (safe: loading guard won't unmount)
      await refreshDrawStatus()
      
      // Refresh user lucky passes to reflect winner/used status changes
      await refreshMyPasses()
      
    } catch (error) {
      console.error('Error en sorteo:', error)
      setCurrentStep(DRAW_STEP.IDLE)
    } finally {
      isDrawingRef.current = false
    }
  }

  const handleContinueToNextPrize = async () => {
    // Reset step and start new draw
    setCurrentStep(DRAW_STEP.IDLE)
    setTargetWinnerSlot(null)
    // Small delay to allow UI update
    await new Promise(resolve => setTimeout(resolve, 100))
    await handleStartDraw()
  }

  const openResetModal = () => {
    setIsResetModalOpen(true)
  }

  const confirmReset = async () => {
    setIsResetModalOpen(false)
    try {
      await resetDraw()
      setCurrentStep(DRAW_STEP.IDLE)
      setAllWinners([])
      setLastWinner(null)
      setTargetWinnerSlot(null)
      
      // Refresh user lucky passes to reflect reverted active status
      await refreshMyPasses()
    } catch (error) {
      console.error('Error reiniciando sorteo:', error)
    }
  }

  // Only show full-page loading during the VERY FIRST load (raffle not yet available).
  // Mid-session refreshes (e.g. refreshDrawStatus after a draw) must NOT trigger this guard
  // because it would unmount the canvas / roulette animation.
  if (!raffle && (isLoadingRaffle || isLoadingDrawStatus)) {
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
                  {participants.length} participantes • Premio {currentPrize} de {totalPrizes}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* IDLE + Can Draw = Start New Draw */}
              {currentStep === DRAW_STEP.IDLE && canDraw && (
                <Button onClick={handleStartDraw} size="lg" className="gap-2">
                  <Play className="size-4" />
                  Iniciar Sorteo Premio {currentPrize}
                </Button>
              )}
              
              {/* IDLE + Cannot Draw + Has Result = Sorteo Completado, show Reset */}
              {currentStep === DRAW_STEP.IDLE && !canDraw && allWinners.length > 0 && (
                <Button onClick={openResetModal} variant="outline" size="lg" className="gap-2 border-red-500 text-red-400 hover:bg-red-500/10">
                  <RotateCcw className="size-4" />
                  Reiniciar Sorteo
                </Button>
              )}

              {/* View Winners Dropdown — always available when raffle is drawn */}
              {raffle?.status === 'drawn' && (
                <WinnersDropdown raffleId={raffle.id}>
                  <Trophy className="size-4" />
                </WinnersDropdown>
              )}
              
              {/* SPINNING = Disabled button */}
              {currentStep === DRAW_STEP.SPINNING && (
                <Button disabled size="lg" variant="ghost" className="gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sorteando...
                </Button>
              )}
              
              {/* WINNER + Can Draw = Continue to next prize */}
              {currentStep === DRAW_STEP.WINNER && canDraw && (
                <Button onClick={handleContinueToNextPrize} size="lg" className="gap-2">
                  <Play className="size-4" />
                  Continuar con Premio {currentPrize}
                </Button>
              )}
              
              {/* WINNER + Cannot Draw = Sorteo terminado, show Reset */}
              {currentStep === DRAW_STEP.WINNER && !canDraw && (
                <Button onClick={openResetModal} variant="outline" size="lg" className="gap-2 border-red-500 text-red-400 hover:bg-red-500/10">
                  <RotateCcw className="size-4" />
                  Reiniciar Sorteo
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 min-h-[calc(100vh-120px)]">
          
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
                winners={allWinners}
                discarded={[]}
              />
            </Card>
          </aside>

          {/* Centro - Ruleta */}
          <section className="flex flex-col items-center justify-start overflow-y-auto py-4">
            <RuletaCanvas
              slots={luckyPassSlots}
              currentStep={currentStep}
              winner={lastWinner ?? undefined}
              targetSlot={targetWinnerSlot}
            />
          </section>

          {/* Aside Derecho - Ganadores */}
          <aside className="space-y-4">
            <Card className="p-4 bg-bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="size-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Ganadores</h2>
                <Badge variant="subtle">{allWinners.length}</Badge>
              </div>
              <GanadoresList winners={allWinners} />
            </Card>
          </aside>
        </div>
      </main>

      {/* Modal Confirmar Reinicio */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        hasWinners={allWinners.length > 0}
        raffleTitle={raffle?.title ?? undefined}
      />
    </div>
  )
}

export default StreamingPage
