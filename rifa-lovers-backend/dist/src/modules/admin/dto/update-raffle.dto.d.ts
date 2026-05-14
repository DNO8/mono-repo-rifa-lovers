import { RaffleStatus } from '@prisma/client';
export declare class UpdateRaffleDto {
    title?: string;
    description?: string;
    goalPacks?: number;
    maxTicketNumber?: number;
    startDate?: string;
    endDate?: string;
    status?: RaffleStatus;
}
