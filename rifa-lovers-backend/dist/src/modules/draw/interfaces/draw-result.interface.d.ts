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
    isComplete?: boolean;
}
export interface AdminDrawWinner extends DrawWinner {
    userPhone: number | null;
    userAddress: string | null;
}
export interface AdminDrawResult extends Omit<DrawResult, 'winners'> {
    winners: AdminDrawWinner[];
}
export interface UserDetails {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    organizationId: string | null;
}
export interface RaffleWithOrg {
    id: string;
    organizationId: string | null;
    status: string;
}
