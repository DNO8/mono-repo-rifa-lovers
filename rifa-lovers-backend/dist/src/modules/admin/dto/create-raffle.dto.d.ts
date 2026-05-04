import { RaffleStatus } from '@prisma/client';
export declare class CreatePrizeDto {
    name: string;
    description?: string;
}
export declare class CreateRaffleDto {
    title: string;
    description?: string;
    goalPacks: number;
    maxTicketNumber?: number;
    startDate?: string;
    endDate?: string;
    status?: RaffleStatus;
    prizes?: CreatePrizeDto[];
}
