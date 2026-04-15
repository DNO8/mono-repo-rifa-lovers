import { RaffleStatus } from '@prisma/client';
export declare class CreateRaffleDto {
    title: string;
    description?: string;
    goalPacks: number;
    startDate?: string;
    endDate?: string;
    status?: RaffleStatus;
}
