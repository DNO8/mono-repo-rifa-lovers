import { NewsletterRepository } from './newsletter.repository';
import { ResendService } from '../email/resend.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { SendCampaignDto } from './dto/send-campaign.dto';
export declare class NewsletterService {
    private readonly newsletterRepository;
    private readonly resendService;
    constructor(newsletterRepository: NewsletterRepository, resendService: ResendService);
    checkSubscription(email: string): Promise<{
        subscribed: boolean;
    }>;
    subscribe(dto: SubscribeDto): Promise<{
        id: string;
        name: string | null;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
    unsubscribe(email: string): Promise<{
        message: string;
    }>;
    getSubscribers(): Promise<{
        subscribers: {
            id: string;
            name: string | null;
            email: string;
            isActive: boolean;
            subscribedAt: Date;
            unsubscribedAt: Date | null;
        }[];
        activeCount: number;
        totalCount: number;
    }>;
    getCampaigns(): Promise<{
        id: string;
        createdAt: Date;
        subject: string;
        body: string;
        sentBy: string | null;
        sentAt: Date | null;
        recipientCount: number;
    }[]>;
    sendCampaign(dto: SendCampaignDto, adminId: string): Promise<{
        message: string;
        recipientCount: number;
        campaignId?: undefined;
        totalSubscribers?: undefined;
        errors?: undefined;
    } | {
        campaignId: string;
        recipientCount: number;
        totalSubscribers: number;
        errors: string[] | undefined;
        message?: undefined;
    }>;
}
