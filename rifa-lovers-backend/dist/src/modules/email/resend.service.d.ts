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
export declare class ResendService {
    private readonly config;
    private readonly logger;
    private readonly resend;
    constructor(config: ConfigService);
    private getFromEmail;
    sendWinnerEmail(data: WinnerEmailData): Promise<void>;
    sendContactFormToAdmin(data: ContactFormData): Promise<void>;
    sendContactConfirmationToUser(data: ContactFormData): Promise<void>;
    private buildWinnerEmailTemplate;
    private buildContactFormTemplate;
    private buildContactConfirmationTemplate;
}
