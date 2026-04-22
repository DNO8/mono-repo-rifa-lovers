import { ConfigService } from '@nestjs/config';
export interface WinnerEmailData {
    toEmail: string;
    toName: string;
    prizeName: string;
    passNumber: number;
    raffleName: string | null;
}
export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}
export interface PurchaseConfirmationData {
    toEmail: string;
    toName: string;
    purchaseId: string;
    raffleName: string;
    packName: string;
    quantity: number;
    totalAmount: number;
    luckyPassCount: number;
    ticketNumbers: number[];
}
export declare class ResendService {
    private readonly config;
    private readonly logger;
    private readonly resend;
    constructor(config: ConfigService);
    private getFromEmail;
    sendWinnerEmail(data: WinnerEmailData): Promise<void>;
    sendContactFormToAdmin(data: ContactFormData): Promise<void>;
    sendContactConfirmationToUser(data: ContactFormData): Promise<void>;
    sendPurchaseConfirmation(data: PurchaseConfirmationData): Promise<void>;
    private buildPurchaseConfirmationTemplate;
    private buildWinnerEmailTemplate;
    private buildContactFormTemplate;
    private buildContactConfirmationTemplate;
}
