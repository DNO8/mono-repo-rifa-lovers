import { useNavigate } from 'react-router'
import { ArrowRight, Sparkles, Loader2, Heart, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { usePacks } from '@/hooks/use-packs'
import { useAuthStore } from '@/stores/auth.store'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { mapPacksToPricingTiers } from '@/lib/mappers/pack.mapper'
import { cn } from '@/lib/utils'

const SHOW_PACK_MOM = false

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
          <Badge variant="subtle" className="mb-4">Elige tu Pack</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3">
            Elige tu{' '}
            <span className="gradient-text">Pack</span>
          </h2>
          <p className="text-base text-text-secondary max-w-lg mx-auto">
            Participa, recibe un producto digital y vive la experiencia RifaLovers.
          </p>
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
                    Más Elegido
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

        {/* Pack Mom Section — controlled by SHOW_PACK_MOM feature flag */}
        {SHOW_PACK_MOM && !isLoading && !error && (
          <div className="mt-16 md:mt-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
                Alianza{' '}
                <span className="gradient-text">Pack Mom</span>
              </h2>
              <p className="text-base text-text-secondary max-w-lg mx-auto">
                Participa en la rifa y recibe un pack de regalo exclusivo de Laboratorio SYS.
              </p>
            </div>

            <Card variant="glass" className="relative p-6 md:p-10 shadow-glow ring-1 ring-primary/20 max-w-2xl mx-auto">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="gradient">
                  <Heart className="size-3" />
                  Alianza Exclusiva
                </Badge>
              </div>

              <div className="flex items-center justify-center gap-3 mb-6">
                <img
                  src="/partners/logo-sys.svg"
                  alt="Laboratorio SYS"
                  className="h-8 md:h-10"
                />
                <span className="text-sm text-text-tertiary">x</span>
                <span className="text-xl font-bold text-primary">RifaLovers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-bg-muted border border-border-light p-4">
                  <h3 className="font-bold text-text-primary mb-1">Pack Mom</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-extrabold text-text-primary">$9.990</span>
                    <span className="text-xs text-text-tertiary line-through">$14.990</span>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      1 LuckyPass
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Pack Anti-Mosquito SYS
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl bg-bg-purple-soft/40 border border-primary/15 p-4">
                  <h3 className="font-bold text-text-primary mb-1">Pack Mom Premium</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-extrabold text-text-primary">$14.990</span>
                    <span className="text-xs text-text-tertiary line-through">$24.990</span>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      3 LuckyPass
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Pack Hidratante SYS
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-xs text-text-tertiary mb-4 italic">
                Los packs de regalo SYS incluyen productos seleccionados de Laboratorio SYS. Consulta los detalles de cada pack en sus respectivas páginas.
              </p>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/pack-mom')}
              >
                Ver Pack Mom
                <ArrowRight className="size-4" />
              </Button>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
