import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SupabaseModule } from '../../config/supabase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupabaseModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, JwtStrategy],
  exports: [AuthService, UsersService, JwtStrategy, PassportModule],
})
export class UsersModule {}
