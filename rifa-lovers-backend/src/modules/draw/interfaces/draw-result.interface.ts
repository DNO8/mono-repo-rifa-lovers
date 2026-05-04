// Backend interfaces for DrawResult with proper typing

export interface DrawWinner {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  prizeId: string;
  prizeName: string;
  prizeDescription: string | null;
  luckyPassId: string;
  passNumber: number;
}

export interface DrawDiscarded {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  luckyPassId: string;
  passNumber: number;
}

export interface DrawResult {
  raffleId: string;
  drawnAt: Date;
  winners: DrawWinner[];
  discarded: DrawDiscarded[];
  isComplete?: boolean; // Indica si todos los premios han sido sorteados
}

export interface AdminDrawWinner extends DrawWinner {
  userPhone: number | null;
  userAddress: string | null;
}

export interface AdminDrawResult extends Omit<DrawResult, 'winners'> {
  winners: AdminDrawWinner[];
}

// Interface for user details from repository
export interface UserDetails {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  organizationId: string | null;
}

// Interface for raffle with organization
export interface RaffleWithOrg {
  id: string;
  organizationId: string | null;
  status: string;
}
