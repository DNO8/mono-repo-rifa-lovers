import { Link } from 'react-router'
import {
  CreditCard,
  Building2,
  BadgeCheck,
  FileText,
  Radio,
  Truck,
} from 'lucide-react'

const TRUST_ITEMS = [
  {
    id: 'flow',
    icon: CreditCard,
    label: 'Pagos seguros',
    sublabel: 'con Flow',
    hasLogo: true,
    logoSrc: '/images/logos/logo-flow.png',
    logoAlt: 'Flow',
  },
  {
    id: 'spa',
    icon: Building2,
    label: 'Empresa SpA',
    sublabel: 'constituida legalmente',
  },
  {
    id: 'marca',
    icon: BadgeCheck,
    label: 'Marca registrada',
    sublabel: '®',
  },
  {
    id: 'bases',
    icon: FileText,
    label: 'Bases legales',
    sublabel: 'públicas',
    href: '/bases-legales',
  },
  {
    id: 'sorteo',
    icon: Radio,
    label: 'Sorteo en vivo',
    sublabel: 'verificable ante notario',
  },
  {
    id: 'envio',
    icon: Truck,
    label: 'Entrega a todo Chile',
    sublabel: 'sin costo adicional',
  },
]

export function TrustBarSection() {
  return (
    <section className="py-5 md:py-6 px-4 md:px-8 border-y border-border-light bg-bg-muted/40">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon
            const inner = (
              <div className="flex items-center gap-2 text-xs md:text-sm shrink-0">
                {'logoSrc' in item ? (
                  <img
                    src={item.logoSrc}
                    alt={item.logoAlt}
                    className="h-6 w-auto object-contain"
                  />
                ) : (
                  <Icon className="size-4 text-primary shrink-0" />
                )}
                <div className="leading-tight">
                  <span className="font-semibold text-text-primary">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-text-tertiary ml-1">{item.sublabel}</span>
                  )}
                </div>
              </div>
            )

            if ('href' in item && item.href) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {inner}
                </Link>
              )
            }

            return <div key={item.id}>{inner}</div>
          })}
        </div>
      </div>
    </section>
  )
}
