import { PrismaService } from '../../database/prisma.service';
import { User, UserRole, Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
