import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: UserRole[]) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (this.allowedRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('No tienes permisos para acceder a este recurso');
  }
}
