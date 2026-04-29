import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../../config/supabase.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RecaptchaService } from '../../common/services/recaptcha.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupabaseModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AuthService, JwtStrategy, RecaptchaService],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
