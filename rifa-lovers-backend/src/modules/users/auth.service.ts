import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseService } from '../../config/supabase.service';
import { RegisterDto, LoginDto, UpdateUserDto, AuthResponseDto, UserResponseDto } from './dto';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone } = registerDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const { data: supabaseData, error: supabaseError } = await this.supabaseService.signUp(
      email.toLowerCase(),
      password,
    );

    if (supabaseError) {
      throw new ConflictException(supabaseError.message);
    }

    if (!supabaseData.user) {
      throw new ConflictException('No se pudo crear el usuario en Supabase');
    }

    const user = await this.prisma.user.create({
      data: {
        id: supabaseData.user.id,
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone: parseFloat(phone),
        role: 'customer',
      },
    });

    return {
      user: this.mapToUserResponse(user),
      accessToken: supabaseData.session?.access_token || '',
      refreshToken: supabaseData.session?.refresh_token || '',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const { data: supabaseData, error: supabaseError } = await this.supabaseService.signIn(
      email.toLowerCase(),
      password,
    );

    if (supabaseError || !supabaseData.user) {
      throw new UnauthorizedException('Usuario y/o contraseña incorrectos');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: supabaseData.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado en el sistema');
    }

    if (user.status === UserStatus.blocked) {
      throw new UnauthorizedException('Usuario bloqueado');
    }

    return {
      user: this.mapToUserResponse(user),
      accessToken: supabaseData.session?.access_token || '',
      refreshToken: supabaseData.session?.refresh_token || '',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === UserStatus.blocked) {
      return null;
    }

    return user;
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapToUserResponse(user);
  }

  async updateProfile(userId: string, updateData: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: updateData.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    const updateDataPrisma: any = {
      email: updateData.email?.toLowerCase() || user.email,
      firstName: updateData.firstName || user.firstName,
      lastName: updateData.lastName || user.lastName,
      phone: updateData.phone || user.phone,
    };

    if (updateData.email) {
      const supabaseUpdates: { email?: string } = {};
      
      supabaseUpdates.email = updateData.email.toLowerCase();

      const { error: supabaseError } = await this.supabaseService.updateUser(userId, supabaseUpdates);

      if (supabaseError) {
        throw new ConflictException('Error al actualizar en Supabase: ' + supabaseError.message);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateDataPrisma,
    });

    return this.mapToUserResponse(updatedUser);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { data, error } = await this.supabaseService.refreshToken(refreshToken);

    if (error || !data.session) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    return {
      accessToken: data.session.access_token,
    };
  }

  private mapToUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? 0,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
