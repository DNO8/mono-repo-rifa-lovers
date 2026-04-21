import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { SupabaseService } from '../../config/supabase.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Throttle({ auth: { limit: 10, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  // Email Confirmation & Password Reset Endpoints

  /**
   * Verify email confirmation token (from email link)
   * GET /auth/confirm?token=xxx&type=email&email=xxx
   */
  @Get('confirm')
  async confirmEmail(
    @Query('token') token: string,
    @Query('type') type: 'email' | 'recovery',
    @Query('email') email: string,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    if (!token || !email) {
      res.redirect(`${frontendUrl}/auth/error?reason=missing_params`);
      return;
    }

    try {
      const { error } = await this.supabaseService.verifyOTP(email, token, type);

      if (error) {
        res.redirect(`${frontendUrl}/auth/error?reason=invalid_token`);
        return;
      }

      // Success: redirect to login or dashboard
      const redirectPath = type === 'recovery' ? '/auth/reset-password' : '/login?verified=true';
      res.redirect(`${frontendUrl}${redirectPath}`);
    } catch {
      res.redirect(`${frontendUrl}/auth/error?reason=verification_failed`);
    }
  }

  /**
   * Resend confirmation email
   * POST /auth/resend-confirmation
   */
  @Post('resend-confirmation')
  @Throttle({ auth: { limit: 3, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async resendConfirmation(@Body('email') email: string): Promise<{ message: string }> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/confirm`;

    const { error } = await this.supabaseService.resendConfirmationEmail(email, redirectUrl);

    if (error) {
      return { message: 'Error al reenviar el email. Intenta más tarde.' };
    }

    return { message: 'Email de confirmación reenviado. Revisa tu bandeja de entrada.' };
  }

  /**
   * Request password reset email
   * POST /auth/forgot-password
   */
  @Post('forgot-password')
  @Throttle({ auth: { limit: 3, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/confirm`;

    const { error } = await this.supabaseService.sendPasswordResetEmail(email, redirectUrl);

    if (error) {
      return { message: 'Error al enviar el email. Intenta más tarde.' };
    }

    return { message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.' };
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ message: string }> {
    // First verify the OTP
    const { error: verifyError, data } = await this.supabaseService.verifyOTP(email, token, 'recovery');

    if (verifyError || !data.user) {
      return { message: 'Token inválido o expirado.' };
    }

    // Update the password
    const { error: updateError } = await this.supabaseService.updateUser(data.user.id, { password });

    if (updateError) {
      return { message: 'Error al actualizar la contraseña. Intenta de nuevo.' };
    }

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
