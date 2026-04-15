import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
export declare class JobsService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly logger;
    private tasks;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    autoSoldOut(): Promise<void>;
    autoClosed(): Promise<void>;
    expirePendingPurchases(): Promise<void>;
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
