import { useNavigate } from 'react-router'
import { ArrowRight, Sparkles, Loader2, Rocket, CheckCircle } from 'lucide-react'
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

        {/* Business Pro Section */}
        {!isLoading && !error && (
          <div className="mt-16 md:mt-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
                ¿Tienes negocio o{' '}
                <span className="gradient-text">emprendimiento?</span>
              </h2>
              <p className="text-base text-text-secondary max-w-lg mx-auto">
                Te ayudamos a vender más y modernizar tu presencia digital de forma simple y rápida.
              </p>
            </div>

            <Card variant="glass" className="relative p-6 md:p-10 shadow-glow ring-1 ring-primary/20 max-w-2xl mx-auto">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="gradient">
                  <Rocket className="size-3" />
                  Para Negocios
                </Badge>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">Business Pro 🚀</h3>
                  <p className="text-sm text-text-secondary">Digitaliza tu negocio y vende más con una solución profesional y rápida.</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm text-text-tertiary line-through">$99.000</div>
                  <div className="text-3xl font-extrabold text-text-primary">$79.990</div>
                  <div className="text-xs text-text-secondary">IVA incluido</div>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  'Catálogo digital con hasta 20 productos o servicios principales',
                  '1 flyer promocional profesional',
                  'Perfil optimizado (Instagram o Google Maps)',
                  'Link único de ventas',
                  '1 mes de mantención incluido',
                  'Entrega hasta 48 horas hábiles',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm font-medium text-primary">
                  <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
                  🎁 Bonus RifaLovers: 1 LuckyPass incluido
                </li>
              </ul>

              {/* Mantención */}
              <div className="rounded-xl bg-bg-purple-soft/60 border border-primary/10 p-4 mb-6">
                <p className="text-sm font-semibold text-text-primary mb-2">Incluye 1 Mes de Mantención</p>
                <p className="text-xs text-text-secondary mb-2">Durante 30 días desde la entrega tendrás:</p>
                <ul className="space-y-1">
                  {[
                    '2 flyers promocionales adicionales',
                    '2 cambios simples de promociones o precios',
                    '1 actualización de horario, contacto o dirección',
                    'Soporte básico por WhatsApp',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                      <div className="size-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-text-tertiary mt-3 italic">
                  No incluye manejo completo de redes sociales, publicidad pagada ni cambios ilimitados.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/emprendedor')}
              >
                Activar Business Pro
                <ArrowRight className="size-4" />
              </Button>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
