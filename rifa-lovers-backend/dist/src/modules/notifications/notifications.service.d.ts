import { ResendService } from '../email/resend.service';
export interface WinnerEmailData {
    toEmail: string;
    toName: string;
    prizeName: string;
    passNumber: number;
    raffleName: string | null;
}
export declare class NotificationsService {
    private readonly resendService;
    constructor(resendService: ResendService);
    sendWinnerEmail(data: WinnerEmailData): Promise<void>;
}
