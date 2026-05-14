import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RaffleSchedulerService } from '../raffles/raffle-scheduler.service';
import { TicketReservationsRepository } from '../ticket-reservations/ticket-reservations.repository';
import { ResendService } from '../email/resend.service';
import { FlowService } from '../payments/flow.service';
import { PurchasesService } from '../purchases/purchases.service';
export declare class JobsService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly raffleSchedulerService;
    private readonly ticketReservationsRepository;
    private readonly resendService;
    private readonly flowService;
    private readonly purchasesService;
    private readonly logger;
    private tasks;
    constructor(prisma: PrismaService, raffleSchedulerService: RaffleSchedulerService, ticketReservationsRepository: TicketReservationsRepository, resendService: ResendService, flowService: FlowService, purchasesService: PurchasesService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    autoSoldOut(): Promise<void>;
    autoClosed(): Promise<void>;
    expirePendingPurchases(): Promise<void>;
    checkPendingPaymentsStatus(): Promise<void>;
    closeExpiredRafflesByEndDate(): Promise<void>;
    expireTicketReservations(): Promise<void>;
    runJobManually(jobName: 'sold_out' | 'closed' | 'expire_purchases'): Promise<{
        success: boolean;
        message: string;
    }>;
    getJobsStatus(): {
        lastRun: {
            soldOut: Date | null;
            closed: Date | null;
            expirePurchases: Date | null;
        };
        nextRun: {
            soldOut: Date;
            closed: Date;
            expirePurchases: Date;
        };
    };
}
