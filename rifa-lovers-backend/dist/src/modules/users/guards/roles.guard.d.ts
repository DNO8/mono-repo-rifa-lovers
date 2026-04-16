import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '@prisma/client';
export declare class RolesGuard implements CanActivate {
    private readonly allowedRoles;
    constructor(allowedRoles: UserRole[]);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
