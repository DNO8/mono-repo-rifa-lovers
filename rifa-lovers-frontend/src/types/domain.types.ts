export interface Raffle {
  id: string
  name: string
  description: string
  prize: string
  prizeImage: string
  ticketPrice: number
  totalTickets: number
  soldCount: number
  progress: number
  drawDate: string
  isActive: boolean
}

export interface Milestone {
  id: string
  title: string
  description: string
  status: 'completed' | 'active' | 'locked'
  icon: string
}

export interface PricingTier {
  id: string
  name: string
  tickets: number
  price: number
  bonusTickets: number
  tagline: string
  cta: string
  popular: boolean
  benefits?: string[]
}

export interface FAQ {
  id: string
  question: string
  answer: string
  icon: string
}

export interface ImpactMetric {
  id: string
  label: string
  value: string
  numericValue: number
  prefix?: string
  suffix?: string
}

export interface NavItem {
  label: string
  href: string
}

export interface Step {
  id: string
  number: string
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
  isHighlighted?: boolean
}

export interface Testimonial {
  id: string
  name: string
  avatar: string
  location: string
  text: string
  rating: number
  isWinner?: boolean
  prizeName?: string
}

export interface Winner {
  id: string
  name: string
  avatar: string
  prize: string
  prizeEmoji: string
  date: string
  raffleName: string
}

export interface LiveActivity {
  id: string
  name: string
  action: string
  ticketCount: number
  timeAgo: string
  city: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Order {
  id: string
  raffleId: string
  raffleName: string
  ticketCount: number
  bonusTickets: number
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

export interface DashboardSummary {
  totalTickets: number
  points: number
  activeRaffle: Raffle | null
  history: Order[]
}

export interface CheckoutPayload {
  raffleId: string
  ticketCount: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Hotspot {
  id: string
  label: string
  spec: string
  position: [number, number, number]
  side: 'left' | 'right'
  icon: import('./ui.types').LucideIconComponent
  color: string
}
