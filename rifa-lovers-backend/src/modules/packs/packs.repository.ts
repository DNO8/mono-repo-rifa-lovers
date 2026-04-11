import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { Prisma, Pack } from '@prisma/client'

@Injectable()
export class PacksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.PackWhereUniqueInput,
  ): Promise<Pack | null> {
    return this.prisma.pack.findUnique({ where })
  }

  async findMany(
    where?: Prisma.PackWhereInput,
    orderBy?: Prisma.PackOrderByWithRelationInput,
  ): Promise<Pack[]> {
    return this.prisma.pack.findMany({ where, orderBy })
  }
}
