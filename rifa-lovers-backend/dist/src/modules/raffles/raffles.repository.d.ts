import { PrismaService } from '../../database/prisma.service';
import { Prisma, Raffle, RaffleStatus } from '@prisma/client';
export declare class RafflesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUnique(where: Prisma.RaffleWhereUniqueInput, include?: Prisma.RaffleInclude): Promise<Raffle | null>;
    findFirst(where: Prisma.RaffleWhereInput, include?: Prisma.RaffleInclude, orderBy?: Prisma.RaffleOrderByWithRelationInput): Promise<Raffle | null>;
    findMany(where?: Prisma.RaffleWhereInput, include?: Prisma.RaffleInclude, orderBy?: Prisma.RaffleOrderByWithRelationInput, skip?: number, take?: number): Promise<Raffle[]>;
    create(data: Prisma.RaffleCreateInput): Promise<Raffle>;
    update(where: Prisma.RaffleWhereUniqueInput, data: Prisma.RaffleUpdateInput): Promise<Raffle>;
    delete(where: Prisma.RaffleWhereUniqueInput): Promise<Raffle>;
    count(where?: Prisma.RaffleWhereInput): Promise<number>;
    findActiveWithProgress(): Promise<Raffle | null>;
    findByStatus(status: RaffleStatus): Promise<Raffle[]>;
    updateStatus(id: string, status: RaffleStatus): Promise<Raffle>;
    findWithPrizes(id: string): Promise<Raffle | null>;
    findUserRaffles(): Promise<Raffle[]>;
    findActiveExpiredRaffles(): Promise<Array<{
        id: string;
        title: string | null;
        status: string;
        endDate: Date | null;
    }>>;
    getUniqueParticipants(raffleId: string): Promise<Array<{
        userId: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        luckyPassIds: string[];
    }>>;
    getUserById(userId: string): Promise<{
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        organizationId: string | null;
        role: string;
    } | null>;
}
