import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async blockUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'blocked' },
    });
  }

  async unblockUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });
  }
}
