import { useNavigate } from 'react-router'
import { ArrowLeft, Gift, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui/spinner'
import { CountdownSection } from '@/features/landing/sections/countdown-section'
import { usePacks } from '@/hooks/use-packs'
import { usePublicRaffles } from '@/hooks/use-raffles'

export default function PackPreventaPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { raffles, isLoading: rafflesLoading } = usePublicRaffles()
  const { packs, isLoading: packsLoading } = usePacks()

  const isLoading = rafflesLoading || packsLoading

  // Buscar pack "Exclusivo Preventa"
  const preventaPack = packs.find((p) => p.name?.toUpperCase() === 'EXCLUSIVO PREVENTA')
  
  // Buscar rifa "Rifa Preventa"
  const preventaRaffle = raffles.find((r) => r.title?.toUpperCase() === 'RIFA PREVENTA')

  const handleObtain = () => {
    if (!preventaPack || !preventaRaffle) return
    const checkoutUrl = `/checkout-preventa?raffle=${preventaRaffle.id}&packId=${preventaPack.id}`
    if (isAuthenticated) {
      navigate(checkoutUrl)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-[1000px]">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </button>

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="gradient" className="mb-4">
            <Gift className="size-3" />
            Preventa Exclusiva
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4">
            Sorteo Privado{' '}
            <span className="gradient-text">SYS</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            Participa gratis en el sorteo exclusivo de cremas y perfumes de Laboratorio SYS.
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-12">
          <CountdownSection />
        </div>

        {/* Pack Card */}
        {preventaPack && preventaRaffle ? (
          <Card variant="glass" className="relative p-6 md:p-10 shadow-glow ring-1 ring-primary/20 max-w-2xl mx-auto">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="gradient">
                <Gift className="size-3" />
                GRATIS
              </Badge>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-1">{preventaPack.name}</h3>
              <p className="text-sm text-text-secondary">
                Participación gratuita en sorteo exclusivo
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-5xl md:text-6xl font-extrabold text-text-primary">
                  $0
                </span>
              </div>
              <p className="text-text-secondary mt-1 text-sm">Sin costo</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-primary">{preventaPack.luckyPassQuantity ?? 1} LuckyPass</strong> para participar en el sorteo privado
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-text-secondary">
                <Gift className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-primary">Sorteo exclusivo:</strong> Cremas y perfumes de Laboratorio SYS
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-primary">Sin pago:</strong> Participación 100% gratuita
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleObtain}
              >
                Obtener Preventa
              </Button>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            Pack preventa no disponible. Contacta al administrador.
          </div>
        )}

        {/* Trust */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <CheckCircle className="size-4 text-success" />
            Participación gratuita - Sin pago requerido
          </div>
        </div>
      </div>
    </div>
  )
}
