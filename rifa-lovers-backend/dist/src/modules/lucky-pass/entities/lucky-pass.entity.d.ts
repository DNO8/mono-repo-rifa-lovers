import { LuckyPassStatus } from '@prisma/client';
export declare class LuckyPassEntity {
    id: string;
    raffleId: string | null;
    userId: string | null;
    userPackId: string | null;
    ticketNumber: number | null;
    status: LuckyPassStatus;
    isWinner: boolean;
    createdAt: Date;
    constructor(partial: Partial<LuckyPassEntity>);
    isActive(): boolean;
    isUsed(): boolean;
    isWinnerStatus(): boolean;
    isCancelled(): boolean;
    canBeUsed(): boolean;
    canWinPrize(): boolean;
    markAsUsed(): void;
    markAsWinner(): void;
    markAsCancelled(): void;
}
