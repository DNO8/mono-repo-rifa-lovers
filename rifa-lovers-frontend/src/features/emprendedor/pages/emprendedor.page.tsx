import { useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Rocket, CheckCircle, Users, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { usePacks } from '@/hooks/use-packs'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui/spinner'

const BENEFITS = [
  { icon: Star, text: '10 LuckyPasses incluidos' },
  { icon: TrendingUp, text: 'Mayor probabilidad de ganar' },
  { icon: Users, text: 'Apoyo directo al ecosistema emprendedor' },
  { icon: Rocket, text: 'Acceso prioritario a futuros sorteos' },
]

export default function EmprendedorPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { raffle, isLoading: raffleLoading } = useActiveRaffle()
  const { packs, isLoading: packsLoading } = usePacks()

  const isLoading = raffleLoading || packsLoading

  const emprendedorPack = packs.find((p) =>
    p.name?.toUpperCase().includes('EMPRENDEDOR'),
  )

  const price = emprendedorPack?.price ?? 19990
  const preSalePrice = emprendedorPack?.isPreSale ? Math.round(price * 0.9) : null
  const tickets = emprendedorPack?.luckyPassQuantity ?? 10

  const handleBuy = () => {
    if (!emprendedorPack || !raffle) return
    const checkoutUrl = `/checkout?raffle=${raffle.id}&packId=${emprendedorPack.id}`
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
      <div className="mx-auto max-w-[800px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="gradient" className="mb-4">
            <Rocket className="size-3" />
            Pack Exclusivo
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4">
            Emprendedor{' '}
            <span className="gradient-text">Legend</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-md mx-auto">
            El pack definitivo para quienes quieren maximizar sus oportunidades y apoyar el ecosistema emprendedor.
          </p>
        </div>

        {/* Main Card */}
        <Card variant="glass" className="p-8 md:p-10 shadow-glow ring-1 ring-primary/20 mb-8">
          {/* Price */}
          <div className="text-center mb-8">
            {preSalePrice && (
              <div className="mb-2">
                <Badge variant="subtle" className="text-xs">
                  Preventa activa
                </Badge>
              </div>
            )}
            <div className="flex items-baseline justify-center gap-3">
              {preSalePrice ? (
                <>
                  <span className="text-2xl text-text-tertiary line-through">
                    ${price.toLocaleString('es-CL')}
                  </span>
                  <span className="text-5xl md:text-6xl font-extrabold text-text-primary">
                    ${preSalePrice.toLocaleString('es-CL')}
                  </span>
                </>
              ) : (
                <span className="text-5xl md:text-6xl font-extrabold text-text-primary">
                  ${price.toLocaleString('es-CL')}
                </span>
              )}
            </div>
            <p className="text-text-secondary mt-2">
              {tickets} LuckyPasses incluidos
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-center gap-3 rounded-xl bg-bg-purple-soft/50 px-4 py-3"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full cursor-pointer"
            onClick={handleBuy}
            disabled={!emprendedorPack || !raffle}
          >
            Comprar Pack Emprendedor Legend
            <ArrowRight className="size-4" />
          </Button>

          {!emprendedorPack && (
            <p className="text-xs text-text-tertiary text-center mt-3">
              Este pack no está disponible en este momento.
            </p>
          )}
        </Card>

        {/* Trust Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <CheckCircle className="size-4 text-success" />
            Pago 100% seguro con Flow
          </div>
        </div>
      </div>
    </div>
  )
}
