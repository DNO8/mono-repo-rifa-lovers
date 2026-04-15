import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { FlowService } from './flow.service';
import { PurchasesService } from '../purchases/purchases.service';
import { UsersService } from '../users/users.service';
interface InitiatePaymentDto {
    purchaseId: string;
}
export declare class PaymentsController {
    private readonly configService;
    private readonly flowService;
    private readonly purchasesService;
    private readonly usersService;
    private readonly logger;
    constructor(configService: ConfigService, flowService: FlowService, purchasesService: PurchasesService, usersService: UsersService);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        purchaseId: string;
        flowOrderId: string;
        paymentUrl: string;
        token: string;
    }>;
    handleFlowReturn(token: string, res: Response): void;
}
export {};
