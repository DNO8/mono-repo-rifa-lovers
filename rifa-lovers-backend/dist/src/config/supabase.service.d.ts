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
    verifyEmailWithRedirect(email: string, token: string, redirectTo: string): Promise<{
        redirectTo: string;
        data: {
            user: import("@supabase/supabase-js").AuthUser | null;
            session: import("@supabase/supabase-js").AuthSession | null;
        };
        error: null;
    } | {
        redirectTo: string;
        data: {
            user: null;
            session: null;
        };
        error: import("@supabase/supabase-js").AuthError;
    }>;
    getUserByEmail(email: string): Promise<{
        data: null;
        error: import("@supabase/supabase-js").AuthError;
    } | {
        data: {
            user: import("@supabase/supabase-js").AuthUser | undefined;
        };
        error: {
            message: string;
        } | null;
    }>;
    resendConfirmationEmail(email: string, redirectUrl: string): Promise<import("@supabase/supabase-js").AuthOtpResponse>;
    sendPasswordResetEmail(email: string, redirectUrl: string): Promise<{
        data: {};
        error: null;
    } | {
        data: null;
        error: import("@supabase/supabase-js").AuthError;
    }>;
    exchangeCodeForSession(code: string): Promise<import("@supabase/supabase-js").AuthTokenResponse>;
    verifyOTP(email: string, token: string, type: 'email' | 'recovery'): Promise<import("@supabase/supabase-js").AuthResponse>;
}
