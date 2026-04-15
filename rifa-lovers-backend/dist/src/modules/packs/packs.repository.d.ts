import { PrismaService } from '../../database/prisma.service';
import { Prisma, Pack } from '@prisma/client';
export declare class PacksRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUnique(where: Prisma.PackWhereUniqueInput): Promise<Pack | null>;
    findMany(where?: Prisma.PackWhereInput, orderBy?: Prisma.PackOrderByWithRelationInput): Promise<Pack[]>;
}
