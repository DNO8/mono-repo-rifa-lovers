import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { SupabaseService } from '../../config/supabase.service';
import { ConfigService } from '@nestjs/config';
import { RecaptchaService } from '../../common/services/recaptcha.service';
import type { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly supabaseService;
    private readonly config;
    private readonly recaptchaService;
    private readonly logger;
    constructor(authService: AuthService, supabaseService: SupabaseService, config: ConfigService, recaptchaService: RecaptchaService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    confirmEmail(token: string, type: 'email' | 'recovery', email: string, res: Response): Promise<void>;
    resendConfirmation(email: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, email: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
