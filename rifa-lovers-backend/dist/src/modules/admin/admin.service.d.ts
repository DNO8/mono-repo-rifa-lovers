import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { RaffleStatus } from '@prisma/client';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto';
import { ResendService } from '../email/resend.service';
export interface KpiData {
    totalSales: number;
    packsSold: number;
    activeUsers: number;
    activeRaffles: number;
    totalPurchases: number;
    pendingPurchases: number;
    completedPurchases: number;
    failedPurchases: number;
    refundedPurchases: number;
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
export interface Participant {
    id: string;
    name: string;
    email: string;
    ticketCount: number;
    tickets: number[];
}
export declare class AdminService {
    private readonly prisma;
    private readonly resendService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, resendService: ResendService, configService: ConfigService);
    createRaffle(adminId: string, dto: CreateRaffleDto): Promise<RaffleWithStats>;
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
    getRaffleDetail(raffleId: string): Promise<{
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
        address: string | null;
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
        address: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    getAllUsers(skip?: number, take?: number): Promise<{
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
}
