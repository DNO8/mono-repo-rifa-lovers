import { Request } from 'express';
import { SupabaseService } from '../../../config/supabase.service';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';
declare const JwtStrategy_base: new (...args: unknown[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly supabaseService;
    private readonly authService;
    constructor(supabaseService: SupabaseService, authService: AuthService);
    validate(req: Request): Promise<User>;
}
export {};
