import { PrismaService } from '../../database/prisma.service';
import { RaffleStatus } from '@prisma/client';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto';
export interface KpiData {
    totalSales: number;
    packsSold: number;
    activeUsers: number;
    activeRaffles: number;
    totalPurchases: number;
    pendingPurchases: number;
    completedPurchases: number;
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
    packsSold: number;
    progressPercentage: number;
    totalRevenue: number;
}
export declare class AdminService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createRaffle(adminId: string, dto: CreateRaffleDto): Promise<{
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
    getAllRaffles(): Promise<RaffleWithStats[]>;
    getKpis(): Promise<KpiData>;
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
    updateUserStatus(userId: string, dto: UpdateUserStatusDto): Promise<{
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
    getAllUsers(skip?: number, take?: number): Promise<{
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
}
