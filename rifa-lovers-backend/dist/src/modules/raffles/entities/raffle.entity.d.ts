import { RaffleStatus } from '@prisma/client';
export declare class RaffleEntity {
    id: string;
    organizationId: string | null;
    title: string | null;
    description: string | null;
    goalPacks: number;
    maxTicketNumber: number;
    status: RaffleStatus;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<RaffleEntity>);
    isActive(): boolean;
    isDraft(): boolean;
    isSoldOut(): boolean;
    isClosed(): boolean;
    isDrawn(): boolean;
    canBeActivated(): boolean;
    canAcceptPurchases(): boolean;
}
