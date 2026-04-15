export const LUCKY_PASS_STATUS = {
  ACTIVE: 'active',
  USED: 'used',
  WINNER: 'winner',
  CANCELLED: 'cancelled',
} as const
export type LuckyPassStatus = (typeof LUCKY_PASS_STATUS)[keyof typeof LUCKY_PASS_STATUS]

export interface LuckyPass {
  id: string
  ticketNumber: number
  status: LuckyPassStatus
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

export const PURCHASE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const
export type PurchaseStatus = (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS]

export interface Purchase {
  id: string
  raffleId: string
  raffleName: string
  totalAmount: number
  status: PurchaseStatus
  createdAt: string
  luckyPassCount: number
}

export interface CreatePurchaseRequest {
  raffleId: string
  packId: string
  quantity: number
  selectedNumbers?: number[]
}

export interface CreatePurchaseResponse {
  id: string
  raffleId: string
  raffleName: string
  totalAmount: number
  status: PurchaseStatus
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

export const RAFFLE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD_OUT: 'sold_out',
  CLOSED: 'closed',
  DRAWN: 'drawn',
} as const
export type RaffleStatus = (typeof RAFFLE_STATUS)[keyof typeof RAFFLE_STATUS]

export interface Raffle {
  id: string
  title: string | null
  description: string | null
  goalPacks: number
  maxTicketNumber: number
  status: RaffleStatus
  createdAt: string
  milestones?: RaffleMilestone[]
}

export const MILESTONE_STATUS = {
  COMPLETED: 'completed',
  ACTIVE: 'active',
  LOCKED: 'locked',
} as const
export type MilestoneStatus = (typeof MILESTONE_STATUS)[keyof typeof MILESTONE_STATUS]

export interface Milestone {
  id: string
  threshold: number | 'flash'
  emoji: string
  name: string
  title: string
  description: string
  status: MilestoneStatus
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

export const USER_ROLE = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  OPERATOR: 'operator',
} as const
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
} as const
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string
  role: UserRole
  status: UserStatus
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
