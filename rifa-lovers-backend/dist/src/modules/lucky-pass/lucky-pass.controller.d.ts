import { LuckyPassService } from './lucky-pass.service';
import { LuckyPassResponseDto, LuckyPassSummaryDto } from './dto';
export declare class LuckyPassController {
    private readonly luckyPassService;
    constructor(luckyPassService: LuckyPassService);
    getMyPasses(userId: string): Promise<LuckyPassResponseDto[]>;
    getMySummary(userId: string): Promise<LuckyPassSummaryDto>;
    checkAvailability(raffleId: string, ticketNumber: number): Promise<{
        available: boolean;
    }>;
}
