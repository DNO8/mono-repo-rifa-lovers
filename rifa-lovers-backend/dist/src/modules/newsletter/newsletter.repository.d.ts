import { PrismaService } from '../../database/prisma.service';
import type { NewsletterSubscriber, NewsletterCampaign } from '@prisma/client';
export declare class NewsletterRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null>;
    createSubscriber(data: {
        email: string;
        name?: string;
    }): Promise<NewsletterSubscriber>;
    reactivateSubscriber(email: string, name?: string): Promise<NewsletterSubscriber>;
    deactivateSubscriber(email: string): Promise<NewsletterSubscriber>;
    findActiveSubscribers(): Promise<NewsletterSubscriber[]>;
    countActiveSubscribers(): Promise<number>;
    findAllSubscribers(): Promise<NewsletterSubscriber[]>;
    createCampaign(data: {
        subject: string;
        body: string;
        sentBy: string;
        recipientCount: number;
        sentAt: Date;
    }): Promise<NewsletterCampaign>;
    findAllCampaigns(): Promise<NewsletterCampaign[]>;
}
