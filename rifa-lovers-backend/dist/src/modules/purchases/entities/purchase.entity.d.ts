import { PurchaseStatus } from '@prisma/client';
export declare class PurchaseEntity {
    id: string;
    raffleId: string | null;
    userId: string | null;
    totalAmount: number | null;
    status: PurchaseStatus;
    createdAt: Date;
    paidAt: Date | null;
    constructor(partial: Partial<PurchaseEntity>);
    isPending(): boolean;
    isPaid(): boolean;
    isFailed(): boolean;
    isRefunded(): boolean;
    canBePaid(): boolean;
    canBeRefunded(): boolean;
    markAsPaid(): void;
    markAsFailed(): void;
    markAsRefunded(): void;
}
