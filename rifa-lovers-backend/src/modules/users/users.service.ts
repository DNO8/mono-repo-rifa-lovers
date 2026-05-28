import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ResendService } from '../email/resend.service';
import { User, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly resendService: ResendService,
    private readonly config: ConfigService,
  ) {}

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
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Enviar email de promoción si el rol es admin u operator
    if ((role === 'admin' || role === 'operator') && user.email) {
      try {
        void this.resendService.sendPromotedRoleEmail({
          toEmail: user.email,
          toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Usuario',
          role,
          frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
        })
      } catch (err) {
      }
    }

    return user;
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
