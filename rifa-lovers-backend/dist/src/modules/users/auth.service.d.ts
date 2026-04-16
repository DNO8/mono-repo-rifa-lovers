import { PrismaService } from '../../database/prisma.service';
import { SupabaseService } from '../../config/supabase.service';
import { RegisterDto, LoginDto, UpdateUserDto, AuthResponseDto, UserResponseDto } from './dto';
import { User } from '@prisma/client';
export declare class AuthService {
    private readonly prisma;
    private readonly supabaseService;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    validateUser(userId: string): Promise<User | null>;
    getProfile(userId: string): Promise<UserResponseDto>;
    updateProfile(userId: string, updateData: UpdateUserDto): Promise<UserResponseDto>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
