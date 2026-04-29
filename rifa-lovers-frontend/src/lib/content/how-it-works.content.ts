import type { LucideIcon } from 'lucide-react'
import { UserPlus, ShoppingBag, CreditCard, Radio, Gift, Shield, Hash, HeartHandshake } from 'lucide-react'

export interface FlowStep {
  id: string
  icon: LucideIcon
  color: string
  bg: string
  step: string
  title: string
  subtitle: string
  bullets: string[]
  badge: string
}

export const FLOW_STEPS: FlowStep[] = [
  {
    id: 'register',
    icon: UserPlus,
    color: '#7B3FE4',
    bg: '#7B3FE415',
    step: '01',
    title: 'Creá tu cuenta gratis',
    subtitle: 'En menos de 1 minuto estás listo para participar.',
    bullets: [
      'Registrate con tu correo o Google.',
      'Es rápido, fácil y sin costo.',
      'Únete a la comunidad que ya está participando.',
    ],
    badge: 'Te mantenemos al tanto de las novedades y ganadores con tu cuenta',
  },
  {
    id: 'pack',
    icon: ShoppingBag,
    color: '#FF4DA6',
    bg: '#FF4DA615',
    step: '02',
    title: 'Elige cuántos LuckyPass quieres',
    subtitle: 'Tú decides cuántas oportunidades quieres para ganar.',
    bullets: [
      'Elige el pack que más te guste.',
      'Cada LuckyPass es una oportunidad real.',
      'Mientras más participas, más chances tienes.',
    ],
    badge: '¡Aprovecha nuestros packs y aumenta tus posibilidades!',
  },
  {
    id: 'pay',
    icon: CreditCard,
    color: '#FF8A3D',
    bg: '#FF8A3D15',
    step: '03',
    title: 'Paga de forma 100% segura',
    subtitle: 'Tu seguridad es nuestra prioridad. Pagos protegidos y confiables.',
    bullets: [
      'Procesamos tu pago con Flow, la plataforma #1 en Chile.',
      'Aceptamos tarjetas de crédito, débito y transferencias.',
      'Tus datos y tu dinero siempre están protegidos.',
    ],
    badge: 'Pagos seguros con Flow: rápido, confiable y protegido.',
  },
  {
    id: 'draw',
    icon: Radio,
    color: '#EF4444',
    bg: '#EF444415',
    step: '04',
    title: 'Sorteo en vivo cada viernes',
    subtitle: 'Transparencia total. En vivo y sin trucos.',
    bullets: [
      'Todos los viernes a las 21:00 hrs.',
      'Transmisión en vivo por nuestras redes sociales.',
      'Conoce al instante si eres uno de nuestros ganadores.',
    ],
    badge: 'Sorteos auditables y grabados: Tú ves, tú confías.',
  },
  {
    id: 'prize',
    icon: Gift,
    color: '#10B981',
    bg: '#10B98115',
    step: '05',
    title: 'Recibe tu premio en casa',
    subtitle: 'Si ganas, nosotros nos encargamos del resto.',
    bullets: [
      'Te contactamos por WhatsApp o mail.',
      'Enviamos tu premio a la puerta de tu casa.',
      'Rápido, seguro y sin complicaciones.',
    ],
    badge: 'Miles de ganadores felices ¡Tú puedes ser el próximo!',
  },
]

export interface TrustItem {
  id: string
  icon: LucideIcon
  color: string
  bg: string
  title: string
  stat: string
  statLabel: string
  description: string
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: 'verified',
    icon: Shield,
    color: '#7B3FE4',
    bg: '#7B3FE420',
    title: 'Sorteo verificable',
    stat: '100%',
    statLabel: 'transparente',
    description: 'Cada sorteo se transmite en vivo. Cualquier persona puede ver el proceso en tiempo real. No hay trampa posible: el LuckyPass ganador se sortea frente a todos.',
  },
  {
    id: 'unique',
    icon: Hash,
    color: '#FF4DA6',
    bg: '#FF4DA620',
    title: 'LuckyPass único',
    stat: '1:1',
    statLabel: 'por participante',
    description: 'Cada LuckyPass corresponde a un número irrepetible dentro de la rifa. Tu número es exclusivamente tuyo hasta que se realice el sorteo.',
  },
  {
    id: 'impact',
    icon: HeartHandshake,
    color: '#10B981',
    bg: '#10B98120',
    title: 'Genera impacto\nJuntos ayudamos a otros',
    stat: '%',
    statLabel: 'de cada compra',
    description: 'Un porcentaje de cada LuckyPass vendido se destina a causas benéficas seleccionadas por nuestra comunidad. Participar aquí significa también ayudar a otros.',
  },
]
