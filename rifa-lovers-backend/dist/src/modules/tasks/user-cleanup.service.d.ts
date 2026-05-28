import { PrismaService } from '../../database/prisma.service';
import { SupabaseService } from '../../config/supabase.service';
export declare class UserCleanupService {
    private readonly prisma;
    private readonly supabaseService;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
    cleanupUnconfirmedUsers(): Promise<void>;
}
