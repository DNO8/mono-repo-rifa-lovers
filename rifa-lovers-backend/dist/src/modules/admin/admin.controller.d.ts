import { AdminService, KpiData, RaffleWithStats } from './admin.service';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto';
import { JobsService } from '../jobs/jobs.service';
export declare class AdminController {
    private readonly adminService;
    private readonly jobsService;
    private readonly logger;
    constructor(adminService: AdminService, jobsService: JobsService);
    createRaffle(dto: CreateRaffleDto, adminId: string): Promise<{
        id: string;
        organizationId: string | null;
        title: string | null;
        description: string | null;
        goalPacks: number;
        maxTicketNumber: number;
        status: import("@prisma/client").$Enums.RaffleStatus;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    getKpis(): Promise<KpiData>;
    getAllUsers(skip?: string, take?: string): Promise<{
        users: {
            id: string;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            _count: {
                purchases: number;
                luckyPasses: number;
            };
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
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
        phone: number | null;
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
        phone: number | null;
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
