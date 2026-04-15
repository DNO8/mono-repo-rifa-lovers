import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { SupabaseService } from '../../../config/supabase.service';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(req: Request): Promise<User> {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.substring(7);

    // Validar token con Supabase
    const { data, error } = await this.supabaseService.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Verificar usuario en nuestra base de datos
    const user = await this.authService.validateUser(data.user.id);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o bloqueado');
    }

    return user;
  }
}
