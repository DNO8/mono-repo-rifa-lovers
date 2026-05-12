import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { FlowService } from './flow.service';
import { PurchasesService } from '../purchases/purchases.service';
import { UsersService } from '../users/users.service';
import { ResendService } from '../email/resend.service';
import { PrismaService } from '../../database/prisma.service';
interface InitiatePaymentDto {
    purchaseId: string;
    idempotencyKey?: string;
}
export declare class PaymentsController {
    private readonly configService;
    private readonly flowService;
    private readonly purchasesService;
    private readonly usersService;
    private readonly resendService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, flowService: FlowService, purchasesService: PurchasesService, usersService: UsersService, resendService: ResendService, prisma: PrismaService);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        purchaseId: string;
        flowOrderId: string;
        paymentUrl: string;
        token: string;
    }>;
    handleFlowReturn(token: string, res: Response): void;
    verifyFlowPaymentStatus(token: string): Promise<{
        flowStatus: number;
        purchaseStatus: import("@prisma/client").$Enums.PurchaseStatus;
        purchaseId: string;
    }>;
}
export {};
