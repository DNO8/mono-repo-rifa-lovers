export declare class PrizeDto {
    id: string;
    name: string | null;
    description: string | null;
    type: string;
}
export declare class MilestoneDto {
    id: string;
    name: string | null;
    requiredPacks: number;
    sortOrder: number;
    isUnlocked: boolean;
    prizes: PrizeDto[];
}
export declare class RaffleResponseDto {
    id: string;
    title: string | null;
    description: string | null;
    goalPacks: number;
    maxTicketNumber: number;
    status: string;
    createdAt: string;
    endDate: string | null;
    milestones?: MilestoneDto[];
}
export declare class RaffleProgressDto {
    raffleId: string;
    packsSold: number;
    revenueTotal: number;
    percentageToGoal: number;
}
