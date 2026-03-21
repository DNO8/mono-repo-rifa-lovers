import type {
  Raffle,
  Milestone,
  PricingTier,
  FAQ,
  ImpactMetric,
  NavItem,
  Step,
  Testimonial,
  Winner,
  LiveActivity,
} from '@/types/domain.types'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Sorteos', href: '/' },
  { label: 'Cómo Funciona', href: '/#como-funciona' },
  { label: 'Impacto Social', href: '/impacto' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
]

export const ACTIVE_RAFFLE: Raffle = {
  id: 'raffle-001',
  name: 'PC Gamer RTX 4080',
  description: 'Una PC Gamer de última generación con RTX 4080, 32GB RAM y monitor 4K.',
  prize: 'PC Gamer RTX 4080',
  prizeImage: '/prize-placeholder.webp',
  ticketPrice: 2000,
  totalTickets: 10000,
  soldCount: 8200,
  progress: 82,
  drawDate: '2025-04-06T23:00:00.000Z',
  isActive: true,
}

export const MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    title: '500 becas entregadas',
    description: 'A familias que hoy tienen apoyo real.',
    status: 'completed',
    icon: 'GraduationCap',
  },
  {
    id: 'ms-2',
    title: '10 iPads para escuelas',
    description: 'Faltan 3 iPads para completar la meta.',
    status: 'active',
    icon: 'Tablet',
  },
  {
    id: 'ms-3',
    title: 'Refugio Animal RL',
    description: 'Próxima meta de impacto social.',
    status: 'locked',
    icon: 'Heart',
  },
]

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-basic',
    name: 'Básico',
    tickets: 1,
    price: 2000,
    bonusTickets: 0,
    tagline: 'Para probar',
    cta: 'Probar ahora',
    popular: false,
  },
  {
    id: 'tier-popular',
    name: 'Popular',
    tickets: 5,
    price: 8000,
    bonusTickets: 1,
    tagline: '+1 ticket de regalo 🎁',
    cta: 'Participar ahora',
    popular: true,
    benefits: ['Participas automáticamente', 'Generas impacto real'],
  },
  {
    id: 'tier-max',
    name: 'Máximo',
    tickets: 10,
    price: 15000,
    bonusTickets: 3,
    tagline: '+3 tickets de regalo 🎁',
    cta: 'Maximizar oportunidades',
    popular: false,
  },
]

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: '¿Cómo recibo mi ticket?',
    answer:
      'Recibes tu ticket al instante en tu correo electrónico y queda disponible en tu cuenta.',
    icon: 'Ticket',
  },
  {
    id: 'faq-2',
    question: '¿A dónde va el dinero?',
    answer:
      'Tu participación genera impacto real. Apoyamos causas verificadas y visibles para todos.',
    icon: 'Heart',
  },
  {
    id: 'faq-3',
    question: '¿Cuándo son los sorteos?',
    answer:
      'Todos los domingos a las 20:00 hrs. Te avisamos por email para que no te pierdas el sorteo en vivo.',
    icon: 'Radio',
  },
  {
    id: 'faq-4',
    question: '¿Es seguro participar?',
    answer:
      'Totalmente seguro y transparente. Pagos protegidos y sorteos en vivo verificables.',
    icon: 'Shield',
  },
]

export const IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'metric-donations',
    label: 'ya entregados en impacto real',
    value: '+$24.5M',
    numericValue: 24,
    prefix: '+$',
    suffix: ',5M',
  },
  {
    id: 'metric-community',
    label: 'personas ya están participando',
    value: '+8.000',
    numericValue: 8000,
    prefix: '+',
  },
  {
    id: 'metric-smiles',
    label: 'Sonrisas generadas',
    value: '+8.421',
    numericValue: 8421,
    prefix: '+',
  },
]

export const STEPS: Step[] = [
  {
    id: 'step-1',
    number: '01',
    title: 'Regístrate y elige tus tickets',
    description: 'Crea tu cuenta, selecciona tus tickets y comienza a participar en segundos.',
    icon: 'ClipboardList',
    color: '#7B3FE4',
    bgColor: 'rgba(123, 63, 228, 0.1)',
  },
  {
    id: 'step-2',
    number: '02',
    title: 'Participa y suma oportunidades',
    description: 'Cada ticket te acerca a ganar y genera impacto real.',
    icon: 'Gift',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.1)',
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Vive el sorteo en vivo',
    description: 'Sorteos transparentes, en tiempo real y sin trucos.',
    icon: 'Radio',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.15)',
    isHighlighted: true,
  },
  {
    id: 'step-4',
    number: '04',
    title: 'Gana y genera impacto',
    description: 'Recibe tu premio y ve cómo tu participación cambia vidas.',
    icon: 'Award',
    color: '#FF8A3D',
    bgColor: 'rgba(255, 138, 61, 0.1)',
  },
]

export const SMILE_COUNT = 8421

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Carolina M.',
    avatar: '👩🏻',
    location: 'Santiago',
    text: '¡No lo podía creer! Compré 3 tickets y gané el iPhone. Lo mejor es saber que parte de mi compra fue a una causa real.',
    rating: 5,
    isWinner: true,
    prizeName: 'iPhone 15 Pro',
  },
  {
    id: 't-2',
    name: 'Andrés P.',
    avatar: '👨🏽',
    location: 'Valparaíso',
    text: 'Me encanta la transparencia. El sorteo en vivo me dio mucha confianza. Ya llevo 4 rifas participando.',
    rating: 5,
  },
  {
    id: 't-3',
    name: 'Valentina R.',
    avatar: '👩🏼',
    location: 'Concepción',
    text: 'Participé por primera vez y quedé enganchada. Es fácil, rápido y sabes que tu plata hace algo bueno.',
    rating: 4,
  },
  {
    id: 't-4',
    name: 'Felipe G.',
    avatar: '👨🏻',
    location: 'Temuco',
    text: '¡Gané la PS5! El proceso fue super transparente y el premio llegó en 3 días. 100% recomendado.',
    rating: 5,
    isWinner: true,
    prizeName: 'PlayStation 5',
  },
  {
    id: 't-5',
    name: 'Sofía L.',
    avatar: '👩🏽',
    location: 'Antofagasta',
    text: 'Lo que más me gusta es el impacto social. Saber que mi ticket ayuda a entregar becas es increíble.',
    rating: 5,
  },
  {
    id: 't-6',
    name: 'Matías D.',
    avatar: '👨🏼',
    location: 'La Serena',
    text: 'El sorteo en vivo es lo mejor. Todo transparente, sin trampas. Seguiré participando cada semana.',
    rating: 5,
  },
]

export const WINNERS: Winner[] = [
  {
    id: 'w-1',
    name: 'Carolina M.',
    avatar: '👩🏻',
    prize: 'iPhone 15 Pro',
    prizeEmoji: '📱',
    date: 'Hace 2 semanas',
    raffleName: 'Rifa Tech Premium',
  },
  {
    id: 'w-2',
    name: 'Felipe G.',
    avatar: '👨🏻',
    prize: 'PlayStation 5',
    prizeEmoji: '🎮',
    date: 'Hace 1 mes',
    raffleName: 'Rifa Gamer',
  },
  {
    id: 'w-3',
    name: 'Daniela S.',
    avatar: '👩🏽',
    prize: 'MacBook Air M3',
    prizeEmoji: '💻',
    date: 'Hace 1 mes',
    raffleName: 'Rifa Apple',
  },
  {
    id: 'w-4',
    name: 'Roberto K.',
    avatar: '👨🏽',
    prize: 'AirPods Pro',
    prizeEmoji: '🎧',
    date: 'Hace 6 semanas',
    raffleName: 'Rifa Mini',
  },
  {
    id: 'w-5',
    name: 'Isidora F.',
    avatar: '👩🏼',
    prize: 'Nintendo Switch OLED',
    prizeEmoji: '🕹️',
    date: 'Hace 2 meses',
    raffleName: 'Rifa Gamer 2',
  },
]

export const LIVE_ACTIVITIES: LiveActivity[] = [
  { id: 'la-1', name: 'María C.', action: 'compró', ticketCount: 3, timeAgo: 'hace 2 min', city: 'Santiago' },
  { id: 'la-2', name: 'Juan P.', action: 'compró', ticketCount: 5, timeAgo: 'hace 5 min', city: 'Viña del Mar' },
  { id: 'la-3', name: 'Ana R.', action: 'compró', ticketCount: 1, timeAgo: 'hace 8 min', city: 'Concepción' },
  { id: 'la-4', name: 'Diego M.', action: 'compró', ticketCount: 10, timeAgo: 'hace 12 min', city: 'Temuco' },
  { id: 'la-5', name: 'Camila S.', action: 'compró', ticketCount: 2, timeAgo: 'hace 15 min', city: 'Antofagasta' },
  { id: 'la-6', name: 'Pedro L.', action: 'compró', ticketCount: 5, timeAgo: 'hace 20 min', city: 'La Serena' },
  { id: 'la-7', name: 'Valentina G.', action: 'compró', ticketCount: 3, timeAgo: 'hace 25 min', city: 'Rancagua' },
  { id: 'la-8', name: 'Tomás B.', action: 'compró', ticketCount: 1, timeAgo: 'hace 30 min', city: 'Iquique' },
]
