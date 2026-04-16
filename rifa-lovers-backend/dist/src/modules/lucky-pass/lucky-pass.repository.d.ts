import { PrismaService } from '../../database/prisma.service';
import { Prisma, LuckyPass, LuckyPassStatus } from '@prisma/client';
export declare class LuckyPassRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUnique(where: Prisma.LuckyPassWhereUniqueInput, include?: Prisma.LuckyPassInclude): Promise<LuckyPass | null>;
    findFirst(where: Prisma.LuckyPassWhereInput, include?: Prisma.LuckyPassInclude, orderBy?: Prisma.LuckyPassOrderByWithRelationInput): Promise<LuckyPass | null>;
    findMany(where?: Prisma.LuckyPassWhereInput, include?: Prisma.LuckyPassInclude, orderBy?: Prisma.LuckyPassOrderByWithRelationInput, skip?: number, take?: number): Promise<LuckyPass[]>;
    create(data: Prisma.LuckyPassCreateInput): Promise<LuckyPass>;
    update(where: Prisma.LuckyPassWhereUniqueInput, data: Prisma.LuckyPassUpdateInput): Promise<LuckyPass>;
    delete(where: Prisma.LuckyPassWhereUniqueInput): Promise<LuckyPass>;
    count(where?: Prisma.LuckyPassWhereInput): Promise<number>;
    findByUser(userId: string, include?: Prisma.LuckyPassInclude): Promise<LuckyPass[]>;
    findByRaffle(raffleId: string, include?: Prisma.LuckyPassInclude): Promise<LuckyPass[]>;
    findByUserPack(userPackId: string): Promise<LuckyPass[]>;
    updateStatus(id: string, status: LuckyPassStatus): Promise<LuckyPass>;
    markAsWinner(id: string): Promise<LuckyPass>;
    findActiveByUser(userId: string): Promise<LuckyPass[]>;
    findWinnersByRaffle(raffleId: string): Promise<LuckyPass[]>;
    findByTicketNumber(raffleId: string, ticketNumber: number): Promise<LuckyPass | null>;
    countByUserAndStatus(userId: string, status?: LuckyPassStatus): Promise<number>;
    countWinnersByUser(userId: string): Promise<number>;
    createMany(data: Prisma.LuckyPassCreateManyInput[]): Promise<Prisma.BatchPayload>;
}
