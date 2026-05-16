import { useNavigate } from 'react-router'
import { ArrowRight, Loader2, Heart, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSelectedRaffle } from '@/context/use-selected-raffle'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { mapPacksToPricingTiers } from '@/lib/mappers/pack.mapper'

const SHOW_PACK_MOM = false

export function PricingSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })
  const navigate = useNavigate()
  const { packs, isLoading, error } = useSelectedRaffle()

  const pricingTiers = mapPacksToPricingTiers(
    packs.filter((p) => p.name?.toUpperCase() !== 'EXCLUSIVO PREVENTA'),
  )

  return (
    <section
      ref={sectionRef}
      id="pricing"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header - solo mostrar si hay pricingTiers */}
        {pricingTiers.length > 0 && (
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
        )}

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

        {/* Pack Cards */}
        {!isLoading && !error && pricingTiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                variant={tier.popular ? 'highlight' : 'glass'}
                className="relative p-6 md:p-8 flex flex-col"
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gradient">Más popular</Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-text-primary mb-1">{tier.name}</h3>
                  <p className="text-sm text-text-secondary">{tier.tagline}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl md:text-5xl font-extrabold text-text-primary">
                    ${tier.price.toLocaleString('es-CL')}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="subtle" className="text-xs">
                    {tier.tickets} LuckyPass
                  </Badge>
                  {tier.bonusTickets > 0 && (
                    <Badge variant="gradient" className="text-xs">
                      +{tier.bonusTickets} bonus
                    </Badge>
                  )}
                </div>

                {tier.benefits && tier.benefits.length > 0 && (
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle className="size-4 text-success shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  variant={tier.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full mt-auto"
                  onClick={() => navigate(`/checkout?packId=${tier.packId}`)}
                >
                  {tier.cta}
                  <ArrowRight className="size-4" />
                </Button>
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
                Una experiencia creada para mamá, Compra un pack exclusivo de Laboratorio SYS y participa por 3 Gift Cards de $100.000 junto a RifaLovers.
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
                  <h3 className="font-bold text-text-primary mb-1">Mom Home Experience</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-extrabold text-text-primary">$19.990</span>
                    <span className="text-xs text-text-tertiary line-through">$23.800</span>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      1 LuckyPass
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Cochecito aromático
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Mikado frutos rojos 50ml
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Crema de manos castaña
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Jabón líquido hidratante
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl bg-bg-purple-soft/40 border border-primary/15 p-4">
                  <h3 className="font-bold text-text-primary mb-1">Mom Skin Ritual</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-extrabold text-text-primary">$39.800</span>
                    <span className="text-xs text-text-tertiary line-through">$46.800</span>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      3 LuckyPass
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Crema facial Labnatur
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Serum facial Labnatur
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Crema de manos Labnatur
                    </li>
                    <li className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle className="size-3 text-success shrink-0" />
                      Bálsamo labial de regalo
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
