import { AdminService, Participant, KpiData, RaffleWithStats } from './admin.service';
import { DrawService } from '../draw/draw.service';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto';
import { JobsService } from '../jobs/jobs.service';
export declare class AdminController {
    private readonly adminService;
    private readonly drawService;
    private readonly jobsService;
    private readonly logger;
    constructor(adminService: AdminService, drawService: DrawService, jobsService: JobsService);
    createRaffle(dto: CreateRaffleDto, adminId: string): Promise<RaffleWithStats>;
    getAllRaffles(): Promise<RaffleWithStats[]>;
    updateRaffle(raffleId: string, dto: UpdateRaffleDto): Promise<{
        id: string;
        organizationId: string | null;
        title: string | null;
        description: string | null;
        goalPacks: number;
        maxTicketNumber: number;
        status: import("@prisma/client").$Enums.RaffleStatus;
        startDate: Date | null;
        endDate: Date | null;
        coverImageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRaffleStatus(raffleId: string, dto: UpdateRaffleStatusDto): Promise<{
        id: string;
        organizationId: string | null;
        title: string | null;
        description: string | null;
        goalPacks: number;
        maxTicketNumber: number;
        status: import("@prisma/client").$Enums.RaffleStatus;
        startDate: Date | null;
        endDate: Date | null;
        coverImageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRaffleById(raffleId: string): Promise<{
        id: string;
        title: string | null;
        description: string | null;
        goalPacks: number;
        maxTicketNumber: number;
        status: import("@prisma/client").$Enums.RaffleStatus;
        createdAt: string;
        endDate: string | null;
        totalPasses: number;
        totalPurchases: number;
    }>;
    getRaffleParticipants(raffleId: string): Promise<Participant[]>;
    getDrawStatus(raffleId: string): Promise<{
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
    executeDraw(raffleId: string, operatorId: string, prizeId?: string): Promise<import("../draw/draw.service").DrawResult>;
    resetDraw(raffleId: string, operatorId: string): Promise<{
        success: boolean;
        message: string;
        raffleId: string;
    }>;
    getKpis(): Promise<KpiData>;
    getAllUsers(skip?: string, take?: string): Promise<{
        users: {
            id: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            _count: {
                purchases: {
                    paid: number;
                    pending: number;
                    failed: number;
                    refunded: number;
                };
                luckyPasses: number;
            };
        }[];
        total: number;
        skip: number;
        take: number;
    }>;
    updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<{
        id: string;
        organizationId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        address: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    blockUser(userId: string, dto: UpdateUserStatusDto): Promise<{
        id: string;
        organizationId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        address: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    getJobsStatus(): Promise<{
        lastRun: {
            soldOut: Date | null;
            closed: Date | null;
            expirePurchases: Date | null;
        };
        nextRun: {
            soldOut: Date;
            closed: Date;
            expirePurchases: Date;
        };
    }>;
    runJobManually(jobName: 'sold_out' | 'closed' | 'expire_purchases'): Promise<{
        success: boolean;
        message: string;
    }>;
}
