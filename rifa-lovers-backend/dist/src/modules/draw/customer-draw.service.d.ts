import { DrawService } from './draw.service';
import { RafflesRepository } from '../raffles/raffles.repository';
export interface CustomerDrawParticipant {
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    luckyPassIds: string[];
}
export interface CustomerDrawAvailability {
    canDraw: boolean;
    reason?: string;
    participants: CustomerDrawParticipant[];
    prizesCount: number;
    activePassesCount: number;
}
export interface CustomerDrawResult {
    winners: Array<{
        userId: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        prizeId: string;
        prizeName: string;
        luckyPassId: string;
    }>;
    discarded: Array<{
        userId: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        luckyPassId: string;
    }>;
}
export declare class CustomerDrawService {
    private readonly drawService;
    private readonly rafflesRepository;
    private readonly logger;
    constructor(drawService: DrawService, rafflesRepository: RafflesRepository);
    checkCustomerDrawAvailability(raffleId: string, customerUserId: string): Promise<CustomerDrawAvailability>;
    executeCustomerDraw(raffleId: string, customerUserId: string): Promise<CustomerDrawResult>;
    private validateCustomerOwnership;
    private getUniqueParticipants;
    private getUserDetails;
}
