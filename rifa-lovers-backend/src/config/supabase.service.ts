import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') || '';

    this.supabase = createClient(supabaseUrl, supabaseKey) as SupabaseClient;
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut(token: string) {
    return this.supabase.auth.admin.signOut(token);
  }

  async getUser(token: string) {
    return this.supabase.auth.getUser(token);
  }

  async refreshToken(refreshToken: string) {
    return this.supabase.auth.refreshSession({ refresh_token: refreshToken });
  }

  async updateUser(userId: string, attributes: { email?: string; password?: string; data?: Record<string, any> }) {
    return this.supabase.auth.admin.updateUserById(userId, attributes);
  }

  // Email verification methods for custom redirect URLs

  async verifyEmailWithRedirect(email: string, token: string, redirectTo: string) {
    return this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    }).then((result) => {
      // After verification, we redirect to the specified URL
      return { ...result, redirectTo };
    });
  }

  async getUserByEmail(email: string) {
    return this.supabase.auth.admin.listUsers().then(({ data, error }) => {
      if (error) return { data: null, error };
      const user = data?.users.find((u) => u.email === email);
      return { data: { user }, error: user ? null : { message: 'User not found' } };
    });
  }

  async resendConfirmationEmail(email: string, redirectUrl: string) {
    return this.supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  }

  async sendPasswordResetEmail(email: string, redirectUrl: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
  }

  async exchangeCodeForSession(code: string) {
    return this.supabase.auth.exchangeCodeForSession(code);
  }

  async verifyOTP(email: string, token: string, type: 'email' | 'recovery') {
    return this.supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
  }

  // Admin methods for user cleanup

  async listUnconfirmedUsers() {
    return this.supabase.auth.admin.listUsers().then(({ data, error }) => {
      if (error) return { data: null, error };
      // Filter users who haven't confirmed their email
      const unconfirmedUsers = data?.users.filter((u) => !u.email_confirmed_at) || [];
      return { data: unconfirmedUsers, error: null };
    });
  }

  async deleteUser(userId: string) {
    return this.supabase.auth.admin.deleteUser(userId);
  }
}
