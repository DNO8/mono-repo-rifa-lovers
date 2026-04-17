import { RafflesRepository } from './raffles.repository';
export declare class RaffleSchedulerService {
    private readonly rafflesRepository;
    private readonly logger;
    constructor(rafflesRepository: RafflesRepository);
    closeExpiredRaffles(): Promise<{
        closed: number;
        errors: string[];
    }>;
}
