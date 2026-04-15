import { LuckyPassRepository } from './lucky-pass.repository';
import { RafflesRepository } from '../raffles/raffles.repository';
import { LuckyPassResponseDto, LuckyPassSummaryDto } from './dto';
export declare class LuckyPassService {
    private readonly luckyPassRepository;
    private readonly rafflesRepository;
    private readonly logger;
    constructor(luckyPassRepository: LuckyPassRepository, rafflesRepository: RafflesRepository);
    findByUser(userId: string): Promise<LuckyPassResponseDto[]>;
    getSummary(userId: string): Promise<LuckyPassSummaryDto>;
    findById(id: string): Promise<LuckyPassResponseDto>;
    findByRaffle(raffleId: string): Promise<LuckyPassResponseDto[]>;
    checkAvailability(raffleId: string, ticketNumber: number): Promise<{
        available: boolean;
    }>;
    markAsWinner(id: string): Promise<LuckyPassResponseDto>;
}
