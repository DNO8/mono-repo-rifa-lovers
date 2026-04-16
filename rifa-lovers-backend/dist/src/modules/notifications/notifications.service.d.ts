import { ConfigService } from '@nestjs/config';
export interface WinnerEmailData {
    toEmail: string;
    toName: string;
    prizeName: string;
    passNumber: number;
    raffleName: string | null;
}
export declare class NotificationsService {
    private readonly config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    sendWinnerEmail(data: WinnerEmailData): Promise<void>;
}
