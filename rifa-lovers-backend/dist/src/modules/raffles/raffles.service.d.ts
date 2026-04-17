import { RafflesRepository } from './raffles.repository';
import { RaffleResponseDto, RaffleProgressDto } from './dto';
import { RaffleStatus } from '@prisma/client';
export declare class RafflesService {
    private readonly rafflesRepository;
    private readonly logger;
    constructor(rafflesRepository: RafflesRepository);
    findActive(): Promise<RaffleResponseDto | null>;
    getActiveProgress(): Promise<RaffleProgressDto>;
    findById(id: string): Promise<RaffleResponseDto>;
    findByStatus(status: RaffleStatus): Promise<RaffleResponseDto[]>;
    getUserRaffles(): Promise<RaffleResponseDto[]>;
}
