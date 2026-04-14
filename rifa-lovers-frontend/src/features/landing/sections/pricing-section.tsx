import { useNavigate, Link } from 'react-router'
import { ArrowRight, Sparkles, Loader2, Rocket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { usePacks } from '@/hooks/use-packs'
import { useAuthStore } from '@/stores/auth.store'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { mapPacksToPricingTiers } from '@/lib/mappers/pack.mapper'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { raffle } = useActiveRaffle()
  const { packs, isLoading, error } = usePacks()

  // Mapear packs de API a PricingTiers
  const pricingTiers = packs.length > 0 ? mapPacksToPricingTiers(packs) : []

  const handleSelect = (packId: string) => {
    const raffleId = raffle?.id ?? ''
    const checkoutUrl = `/checkout?raffle=${raffleId}&packId=${packId}`
    if (isAuthenticated) {
      navigate(checkoutUrl)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="pricing"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Opciones de participación</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Elige cómo quieres{' '}
            <span className="gradient-text">participar y ganar</span>
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-text-secondary">
            Error al cargar los packs. Intenta recargar la página.
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              variant={tier.popular ? 'glass' : 'glass-light'}
              className={cn(
                'relative p-6 md:p-8 glass-hover flex flex-col',
                tier.popular && 'shadow-glow ring-1 ring-primary/20 z-10'
              )}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gradient">
                    <Sparkles className="size-3" />
                    MÁS POPULAR
                  </Badge>
                </div>
              )}

              {/* Tier name */}
              <h3 className="text-lg font-bold text-text-primary mb-1">{tier.name}</h3>
              <p className="text-sm text-text-secondary mb-5">{tier.tagline}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">
                  ${tier.price.toLocaleString('es-CL')}
                </span>
                <span className="text-text-secondary text-sm ml-1">
                  / {tier.tickets} {tier.tickets === 1 ? 'LuckyPass' : 'LuckyPass'}
                </span>
              </div>

              {/* Bonus */}
              {tier.bonusTickets > 0 && (
                <div className="bg-success/10 text-success rounded-lg px-3 py-2 text-sm font-medium mb-5">
                  +{tier.bonusTickets} LuckyPass de regalo 🎁
                </div>
              )}

              {/* Benefits */}
              {tier.benefits && (
                <ul className="space-y-2 mb-6">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="size-1.5 rounded-full bg-primary shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              <div className="mt-auto pt-4">
              <Button
                variant={tier.popular ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                onClick={() => handleSelect(tier.packId)}
              >
                {tier.cta}
                <ArrowRight className="size-4" />
              </Button>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* Emprendedor Legend CTA */}
        {!isLoading && !error && (
          <div className="mt-10 text-center">
            <Link
              to="/emprendedor"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors group cursor-pointer"
            >
              <Rocket className="size-4 text-primary/70 group-hover:text-primary transition-colors" />
              ¿Eres emprendedor? Conoce el Pack Legend
              <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
