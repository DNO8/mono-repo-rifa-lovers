import { PrismaService } from '../../database/prisma.service';
export interface TicketReservationRow {
    id: string;
    raffle_id: string;
    ticket_number: number;
    user_id: string;
    purchase_id: string | null;
    expires_at: Date;
    created_at: Date;
}
export interface TicketReservation {
    id: string;
    raffleId: string;
    ticketNumber: number;
    userId: string;
    purchaseId: string | null;
    expiresAt: Date;
    createdAt: Date;
}
export declare class TicketReservationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findActiveByRaffleAndTickets(raffleId: string, ticketNumbers: number[], tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]): Promise<TicketReservation[]>;
    findActiveByPurchase(purchaseId: string): Promise<TicketReservation[]>;
    findByPurchase(purchaseId: string, tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]): Promise<TicketReservation[]>;
    findActiveByUser(userId: string): Promise<TicketReservation[]>;
    createMany(data: {
        raffleId: string;
        ticketNumber: number;
        userId: string;
        purchaseId: string;
        expiresAt: Date;
    }[], tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]): Promise<void>;
    deleteByPurchase(purchaseId: string, tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]): Promise<void>;
    deleteExpired(): Promise<number>;
}
