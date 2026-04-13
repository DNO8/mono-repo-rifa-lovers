export interface LuckyPass {
  id: string
  ticketNumber: number
  status: 'active' | 'used' | 'winner' | 'cancelled'
  isWinner: boolean
  raffleId: string
  raffleName: string
  createdAt: string
}

export interface LuckyPassSummary {
  total: number
  active: number
  used: number
  winners: number
}

export interface Purchase {
  id: string
  raffleId: string
  raffleName: string
  totalAmount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
}

export interface CreatePurchaseRequest {
  raffleId: string
  packId: string
  quantity: number
  selectedNumber?: number
}

export interface CreatePurchaseResponse {
  id: string
  raffleId: string
  raffleName: string
  totalAmount: number
  status: string
  createdAt: string
  flowOrderId?: string
  paymentUrl?: string
  packName: string
  quantity: number
  unitPrice: number
}

export interface RaffleProgress {
  raffleId: string
  packsSold: number
  revenueTotal: number
  percentageToGoal: number
}

export interface MilestonePrize {
  id: string
  name: string | null
  description: string | null
  type: string
}

export interface RaffleMilestone {
  id: string
  name: string | null
  requiredPacks: number
  sortOrder: number
  isUnlocked: boolean
  prizes: MilestonePrize[]
}

export interface Raffle {
  id: string
  title: string | null
  description: string | null
  goalPacks: number
  status: 'draft' | 'active' | 'sold_out' | 'closed' | 'drawn'
  createdAt: string
  milestones?: RaffleMilestone[]
}

export interface Milestone {
  id: string
  threshold: number | 'flash'
  emoji: string
  name: string
  title: string
  description: string
  status: 'completed' | 'active' | 'locked'
  icon: string
}

// Tipo Pack desde el backend API
export interface Pack {
  id: string
  name: string | null
  price: number
  luckyPassQuantity: number
  isFeatured: boolean
  isPreSale: boolean
  createdAt: string
}

export interface PricingTier {
  id: string
  packId: string  // UUID del pack en el backend
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
  email: string
  firstName: string | null
  lastName: string | null
  phone: string
  role: 'customer' | 'admin' | 'operator'
  status: 'active' | 'blocked'
  createdAt: string
}



export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface Hotspot {
  id: string
  label: string
  spec: string
  description?: string
  position: [number, number, number]
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  side: 'left' | 'right'
  icon: import('./ui.types').LucideIconComponent
  color: string
}
