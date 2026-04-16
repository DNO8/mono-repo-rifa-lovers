export declare class LuckyPassResponseDto {
    id: string;
    ticketNumber: number;
    status: string;
    isWinner: boolean;
    raffleId: string;
    raffleName: string;
    createdAt: string;
}
export declare class LuckyPassSummaryDto {
    totalPasses: number;
    activePasses: number;
    usedPasses: number;
    winnerPasses: number;
    byRaffle?: any[];
}
