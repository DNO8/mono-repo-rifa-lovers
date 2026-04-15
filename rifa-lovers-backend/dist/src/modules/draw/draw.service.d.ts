import { PrismaService } from '../../database/prisma.service';
export interface DrawResult {
    raffleId: string;
    drawnAt: Date;
    winners: {
        prizeId: string;
        prizeName: string;
        prizeDescription: string | null;
        luckyPassId: string;
        passNumber: number;
        userId: string;
        userName: string | null;
        userEmail: string | null;
    }[];
}
export declare class DrawService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private buildUserFullName;
    executeDraw(raffleId: string, adminUserId: string): Promise<DrawResult>;
    getDrawResults(raffleId: string): Promise<DrawResult | null>;
    canExecuteDraw(raffleId: string): Promise<{
        canDraw: boolean;
        reason?: string;
        prizesCount: number;
        activePassesCount: number;
    }>;
}
