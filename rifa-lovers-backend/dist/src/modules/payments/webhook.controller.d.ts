import { ConfigService } from '@nestjs/config';
import { FlowService } from './flow.service';
import { PurchasesService } from '../purchases/purchases.service';
export declare class WebhookController {
    private readonly configService;
    private readonly flowService;
    private readonly purchasesService;
    private readonly logger;
    constructor(configService: ConfigService, flowService: FlowService, purchasesService: PurchasesService);
    handleFlowWebhook(token: string): Promise<{
        received: boolean;
    }>;
    triggerDev(token: string): Promise<{
        received: boolean;
    }>;
}
