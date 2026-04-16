import { ConfigService } from '@nestjs/config';
interface FlowOrderResponse {
    token: string;
    url: string;
    flowOrder: number;
}
export interface FlowPaymentData {
    date: string | null;
    media: string | null;
    amount: number | null;
    currency: string | null;
    fee: number | null;
    balance: number | null;
    transferDate: string | null;
}
export interface FlowPaymentStatus {
    flowOrder: number;
    commerceOrder: string;
    requestDate: string;
    status: number;
    subject: string;
    currency: string;
    amount: number;
    payer: string;
    optional: Record<string, string> | null;
    paymentData: FlowPaymentData;
}
export declare class FlowService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly secretKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    createPaymentOrder(commerceOrder: string, subject: string, amount: number, email: string, returnUrl: string, confirmationUrl: string): Promise<FlowOrderResponse>;
    getPaymentStatus(token: string): Promise<FlowPaymentStatus>;
    private generateSignature;
}
export {};
