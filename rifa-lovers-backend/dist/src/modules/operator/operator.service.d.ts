import { PrismaService } from '../../database/prisma.service';
import { RaffleStatus } from '@prisma/client';
import { CreatePackDto, UpdatePackDto, CreateOrganizationDto } from './dto';
import type { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from '../admin/dto';
import { DrawService } from '../draw/draw.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { SendCampaignDto } from '../newsletter/dto';
import { SupabaseService } from '../../config/supabase.service';
interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
}
export interface OperatorKpiData {
    totalSales: number;
    packsSold: number;
    activeRaffles: number;
    totalPurchases: number;
    pendingPurchases: number;
    completedPurchases: number;
    failedPurchases: number;
    totalLuckyPasses: number;
    winnersCount: number;
}
export interface RaffleWithStats {
    id: string;
    title: string | null;
    description: string | null;
    goalPacks: number;
    status: RaffleStatus;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    coverImageUrl: string | null;
    packsSold: number;
    progressPercentage: number;
    totalRevenue: number;
}
export interface PackWithStats {
    id: string;
    name: string | null;
    price: number;
    luckyPassQuantity: number;
    isFeatured: boolean;
    isPreSale: boolean;
    raffleId: string | null;
    createdAt: Date;
}
export declare class OperatorService {
    private readonly prisma;
    private readonly drawService;
    private readonly newsletterService;
    private readonly supabaseService;
    private readonly logger;
    constructor(prisma: PrismaService, drawService: DrawService, newsletterService: NewsletterService, supabaseService: SupabaseService);
    private assertOrganization;
    createOrganization(userId: string, dto: CreateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    getOrganization(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    getKpis(userId: string): Promise<OperatorKpiData>;
    getRaffles(userId: string): Promise<RaffleWithStats[]>;
    createRaffle(userId: string, dto: CreateRaffleDto): Promise<RaffleWithStats>;
    updateRaffle(userId: string, raffleId: string, dto: UpdateRaffleDto): Promise<RaffleWithStats>;
    updateRaffleStatus(userId: string, raffleId: string, dto: UpdateRaffleStatusDto): Promise<RaffleWithStats>;
    uploadCover(userId: string, raffleId: string, file: UploadedFile): Promise<{
        coverImageUrl: string;
    }>;
    getPacks(userId: string, raffleId: string): Promise<PackWithStats[]>;
    createPack(userId: string, raffleId: string, dto: CreatePackDto): Promise<PackWithStats>;
    updatePack(userId: string, packId: string, dto: UpdatePackDto): Promise<PackWithStats>;
    deletePack(userId: string, packId: string): Promise<void>;
    getParticipants(userId: string, raffleId: string): Promise<{
        id: string;
        name: string;
        email: string;
        ticketCount: number;
        tickets: number[];
    }[]>;
    getDrawStatus(userId: string, raffleId: string): Promise<{
        canExecute: {
            canDraw: boolean;
            reason?: string;
            prizesCount: number;
            activePassesCount: number;
            winnersCount?: number;
            pendingPrizesCount?: number;
        };
        results: import("../draw/draw.service").DrawResult | null;
    }>;
    executeDraw(userId: string, raffleId: string, prizeId?: string): Promise<import("../draw/draw.service").DrawResult>;
    getNewsletterCampaigns(userId: string): Promise<{
        id: string;
        createdAt: Date;
        subject: string;
        body: string;
        sentBy: string | null;
        sentAt: Date | null;
        recipientCount: number;
    }[]>;
    sendNewsletter(userId: string, dto: SendCampaignDto): Promise<{
        remaining: number;
        message: string;
        recipientCount: number;
        campaignId?: undefined;
        totalSubscribers?: undefined;
        errors?: undefined;
    } | {
        remaining: number;
        campaignId: string;
        recipientCount: number;
        totalSubscribers: number;
        errors: string[] | undefined;
        message?: undefined;
    }>;
}
export {};
