import { OperatorService } from './operator.service';
import { CreatePackDto, UpdatePackDto, CreateOrganizationDto } from './dto';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from '../admin/dto';
export declare class OperatorController {
    private readonly operatorService;
    private readonly logger;
    constructor(operatorService: OperatorService);
    getOrganization(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    createOrganization(userId: string, dto: CreateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    getKpis(userId: string): Promise<import("./operator.service").OperatorKpiData>;
    getRaffles(userId: string): Promise<import("./operator.service").RaffleWithStats[]>;
    createRaffle(userId: string, dto: CreateRaffleDto): Promise<import("./operator.service").RaffleWithStats>;
    updateRaffle(userId: string, raffleId: string, dto: UpdateRaffleDto): Promise<import("./operator.service").RaffleWithStats>;
    updateRaffleStatus(userId: string, raffleId: string, dto: UpdateRaffleStatusDto): Promise<import("./operator.service").RaffleWithStats>;
    uploadCover(userId: string, raffleId: string, file: {
        buffer: Buffer;
        mimetype: string;
        originalname: string;
        size: number;
    }): Promise<{
        coverImageUrl: string;
    }>;
    getPacks(userId: string, raffleId: string): Promise<import("./operator.service").PackWithStats[]>;
    createPack(userId: string, raffleId: string, dto: CreatePackDto): Promise<import("./operator.service").PackWithStats>;
    updatePack(userId: string, packId: string, dto: UpdatePackDto): Promise<import("./operator.service").PackWithStats>;
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
    sendNewsletter(userId: string, dto: {
        subject: string;
        body: string;
    }): Promise<{
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
