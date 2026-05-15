import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
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
        winnerName: string | null;
        userName: string | null;
        userEmail: string | null;
    }[];
    discarded: {
        luckyPassId: string;
        passNumber: number;
        userId: string;
        userName: string | null;
        userEmail: string | null;
    }[];
    isComplete?: boolean;
}
export interface AdminDrawResult extends DrawResult {
    winners: (DrawResult['winners'][number] & {
        userPhone: string | null;
        userAddress: string | null;
    })[];
}
export declare class DrawService {
    private readonly prisma;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    private buildUserFullName;
    executeDraw(raffleId: string, adminUserId: string, prizeId?: string): Promise<DrawResult>;
    getDrawResults(raffleId: string): Promise<DrawResult | null>;
    getAdminDrawResults(raffleId: string): Promise<AdminDrawResult | null>;
    canExecuteDraw(raffleId: string): Promise<{
        canDraw: boolean;
        reason?: string;
        prizesCount: number;
        activePassesCount: number;
        winnersCount?: number;
        pendingPrizesCount?: number;
    }>;
    getWinnersCount(raffleId: string): Promise<number>;
    getUnlockedPrizesCount(raffleId: string): Promise<number>;
    resetDraw(raffleId: string, operatorId: string): Promise<{
        success: boolean;
        message: string;
        raffleId: string;
    }>;
}
