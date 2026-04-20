import { LuckyPassRepository } from './lucky-pass.repository';
import { RafflesRepository } from '../raffles/raffles.repository';
import { PrismaService } from '../../database/prisma.service';
import { LuckyPassResponseDto, LuckyPassSummaryDto } from './dto';
export declare class LuckyPassService {
    private readonly luckyPassRepository;
    private readonly rafflesRepository;
    private readonly prisma;
    private readonly logger;
    constructor(luckyPassRepository: LuckyPassRepository, rafflesRepository: RafflesRepository, prisma: PrismaService);
    findByUser(userId: string): Promise<LuckyPassResponseDto[]>;
    getSummary(userId: string): Promise<LuckyPassSummaryDto>;
    findById(id: string): Promise<LuckyPassResponseDto>;
    findByRaffle(raffleId: string): Promise<LuckyPassResponseDto[]>;
    checkAvailability(raffleId: string, ticketNumber: number, excludePurchaseId?: string): Promise<{
        available: boolean;
    }>;
    markAsWinner(id: string): Promise<LuckyPassResponseDto>;
}
