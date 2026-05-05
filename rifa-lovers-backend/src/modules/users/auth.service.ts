import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseService } from '../../config/supabase.service';
import { RegisterDto, LoginDto, UpdateUserDto, AuthResponseDto, UserResponseDto } from './dto';
import { mapUserToDto } from './mappers/user.mapper';
import { Prisma, User, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone, address } = registerDto;

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
        address,
      },
    });

    return {
      user: mapUserToDto(user),
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

    // Check if email is confirmed
    if (!supabaseData.user.email_confirmed_at) {
      throw new UnauthorizedException('Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
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
      user: mapUserToDto(user),
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

    return mapUserToDto(user);
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

    // --- Verify current password before changing to new password ---
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new UnauthorizedException('Debes ingresar tu contraseña actual para cambiarla');
      }
      if (!user.email) {
        throw new UnauthorizedException('Usuario sin email registrado');
      }
      // Verify by attempting sign-in with current password
      const { error: verifyError } = await this.supabaseService.signIn(
        user.email,
        updateData.currentPassword,
      );
      if (verifyError) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }
    }

    const updateDataPrisma: Prisma.UserUpdateInput = {
      email: updateData.email?.toLowerCase() || user.email,
      firstName: updateData.firstName || user.firstName,
      lastName: updateData.lastName || user.lastName,
      phone: this.parsePhone(updateData.phone, user.phone),
    };

    // --- Update Supabase ---
    const supabaseUpdates: { email?: string; password?: string } = {};
    if (updateData.email) {
      supabaseUpdates.email = updateData.email.toLowerCase();
    }
    if (updateData.newPassword) {
      supabaseUpdates.password = updateData.newPassword;
    }
    if (supabaseUpdates.email || supabaseUpdates.password) {
      const { error: supabaseError } = await this.supabaseService.updateUser(userId, supabaseUpdates);
      if (supabaseError) {
        throw new ConflictException('Error al actualizar en Supabase: ' + supabaseError.message);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateDataPrisma,
    });

    return mapUserToDto(updatedUser);
  }

  private parsePhone(phone?: string, fallback: number | null = null): number | undefined {
    if (phone === undefined || phone === null || phone === '') return fallback ?? undefined;
    const cleaned = phone.replace(/[^\d]/g, '');
    if (!cleaned) return fallback ?? undefined;
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return fallback ?? undefined;
    return parsed;
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

}
