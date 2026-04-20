import { PrismaService } from '../../database/prisma.service';
import { TicketReservationsRepository } from './ticket-reservations.repository';
import { TicketReservationResponseDto } from './dto';
export declare class TicketReservationsService {
    private readonly reservationsRepository;
    private readonly prisma;
    private readonly logger;
    constructor(reservationsRepository: TicketReservationsRepository, prisma: PrismaService);
    reserve(userId: string, raffleId: string, ticketNumbers: number[], purchaseId: string): Promise<TicketReservationResponseDto[]>;
    getActiveReservationsForPurchase(purchaseId: string): Promise<TicketReservationResponseDto[]>;
    getActiveReservationsForUser(userId: string): Promise<TicketReservationResponseDto[]>;
    release(purchaseId: string): Promise<void>;
    convertToLuckyPasses(purchaseId: string, userId: string, userPackId: string, raffleId: string, tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]): Promise<{
        ticketNumber: number;
    }[]>;
    isTicketReservedOrTaken(raffleId: string, ticketNumber: number, excludePurchaseId?: string): Promise<boolean>;
}
