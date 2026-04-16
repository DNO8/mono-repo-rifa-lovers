import { RaffleStatus } from '@prisma/client';
export declare class UpdateRaffleDto {
    title?: string;
    description?: string;
    goalPacks?: number;
    startDate?: string;
    endDate?: string;
    status?: RaffleStatus;
}
