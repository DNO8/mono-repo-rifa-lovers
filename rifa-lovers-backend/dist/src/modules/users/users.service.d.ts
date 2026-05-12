import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ResendService } from '../email/resend.service';
import { User, UserRole, Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    private readonly resendService;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, resendService: ResendService, config: ConfigService);
    findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updateRole(userId: string, role: UserRole): Promise<User>;
    blockUser(userId: string): Promise<User>;
    unblockUser(userId: string): Promise<User>;
}
