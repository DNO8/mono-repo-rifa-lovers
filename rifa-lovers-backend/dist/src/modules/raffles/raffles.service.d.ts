import { RafflesRepository } from './raffles.repository';
import { PacksRepository } from '../packs/packs.repository';
import { RaffleResponseDto, RaffleProgressDto } from './dto';
import { RaffleStatus } from '@prisma/client';
export declare class RafflesService {
    private readonly rafflesRepository;
    private readonly packsRepository;
    constructor(rafflesRepository: RafflesRepository, packsRepository: PacksRepository);
    findActive(): Promise<RaffleResponseDto | null>;
    getActiveProgress(): Promise<RaffleProgressDto>;
    getPacksByRaffle(raffleId: string): Promise<import("../packs/dto").PackResponseDto[]>;
    getProgressByRaffle(raffleId: string): Promise<RaffleProgressDto>;
    findById(id: string): Promise<RaffleResponseDto>;
    findByStatus(status: RaffleStatus): Promise<RaffleResponseDto[]>;
    getPublicRaffles(): Promise<RaffleResponseDto[]>;
    getUserRaffles(userId: string): Promise<RaffleResponseDto[]>;
}
