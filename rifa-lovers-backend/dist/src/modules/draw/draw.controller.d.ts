import { DrawService, DrawResult } from './draw.service';
export declare class DrawController {
    private readonly drawService;
    private readonly logger;
    constructor(drawService: DrawService);
    executeDraw(raffleId: string, adminUserId: string): Promise<DrawResult>;
    checkDrawAvailability(raffleId: string): Promise<{
        canDraw: boolean;
        reason?: string;
        prizesCount: number;
        activePassesCount: number;
    }>;
    getDrawResults(raffleId: string): Promise<DrawResult | {
        message: string;
    }>;
    getDrawResultsAlt(raffleId: string): Promise<DrawResult | {
        message: string;
    }>;
}
