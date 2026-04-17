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
