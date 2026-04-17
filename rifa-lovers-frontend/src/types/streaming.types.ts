// Const Types Pattern - Single source of truth
const DRAW_STEP = {
  IDLE: 'idle',
  LOADING: 'loading',
  SPINNING: 'spinning',
  WATER: 'water',
  WINNER: 'winner',
  FINISHED: 'finished',
} as const;

type DrawStep = (typeof DRAW_STEP)[keyof typeof DRAW_STEP];

const RAFFLE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD_OUT: 'sold_out',
  CLOSED: 'closed',
  DRAWN: 'drawn',
} as const;

type RaffleStatus = (typeof RAFFLE_STATUS)[keyof typeof RAFFLE_STATUS];

// Flat Interfaces Pattern - One level depth
interface UserIdentity {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface PrizeInfo {
  prizeId: string;
  prizeName: string;
}

interface LuckyPassInfo {
  luckyPassId: string;
  passNumber: number;
}

// Base interfaces using composition
export interface CustomerDrawParticipant extends UserIdentity {
  luckyPassIds: string[];
}

export interface CustomerDrawAvailability {
  canDraw: boolean;
  reason?: string;
  participants: CustomerDrawParticipant[];
  prizesCount: number;
  activePassesCount: number;
}

export interface CustomerDrawResult {
  winners: Array<UserIdentity & PrizeInfo & LuckyPassInfo>;
  discarded: Array<UserIdentity & LuckyPassInfo>;
}

export interface RaffleDetails {
  id: string;
  title: string | null;
  description: string | null;
  status: RaffleStatus;
  goalPacks: number;
  maxTicketNumber: number;
  endDate: string | null;
  createdAt: string;
}

// Export constants for runtime use
export { DRAW_STEP, RAFFLE_STATUS };
export type { DrawStep };
