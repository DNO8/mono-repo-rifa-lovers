import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') || '';

    this.supabase = createClient(supabaseUrl, supabaseKey);
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
}
