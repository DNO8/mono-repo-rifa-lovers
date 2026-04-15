import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private readonly configService;
    private readonly supabase;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    signUp(email: string, password: string): Promise<import("@supabase/supabase-js").AuthResponse>;
    signIn(email: string, password: string): Promise<import("@supabase/supabase-js").AuthTokenResponsePassword>;
    signOut(token: string): Promise<{
        data: null;
        error: import("@supabase/supabase-js").AuthError | null;
    }>;
    getUser(token: string): Promise<import("@supabase/supabase-js").UserResponse>;
    refreshToken(refreshToken: string): Promise<import("@supabase/supabase-js").AuthResponse>;
    updateUser(userId: string, attributes: {
        email?: string;
        password?: string;
        data?: Record<string, any>;
    }): Promise<import("@supabase/supabase-js").UserResponse>;
}
