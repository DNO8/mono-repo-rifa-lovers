import { useNavigate } from 'react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ACTIVE_RAFFLE, PRICING_TIERS } from '@/lib/constants'
import { useAuthStore } from '@/stores/auth.store'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const handleSelect = (tickets: number) => {
    const checkoutUrl = `/checkout?raffle=${ACTIVE_RAFFLE.id}&tickets=${tickets}`
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.id}
              variant={tier.popular ? 'glass' : 'glass-light'}
              className={cn(
                'relative p-6 md:p-8 glass-hover',
                tier.popular && 'md:scale-105 md:-my-4 shadow-glow ring-1 ring-primary/20 z-10'
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
                  / {tier.tickets} {tier.tickets === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>

              {/* Bonus */}
              {tier.bonusTickets > 0 && (
                <div className="bg-success/10 text-success rounded-lg px-3 py-2 text-sm font-medium mb-5">
                  +{tier.bonusTickets} {tier.bonusTickets === 1 ? 'ticket' : 'tickets'} de regalo 🎁
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
              <Button
                variant={tier.popular ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                onClick={() => handleSelect(tier.tickets)}
              >
                {tier.cta}
                <ArrowRight className="size-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
