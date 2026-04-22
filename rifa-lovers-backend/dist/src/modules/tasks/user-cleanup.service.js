"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UserCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../database/prisma.service");
const supabase_service_1 = require("../../config/supabase.service");
let UserCleanupService = UserCleanupService_1 = class UserCleanupService {
    constructor(prisma, supabaseService) {
        this.prisma = prisma;
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(UserCleanupService_1.name);
    }
    async cleanupUnconfirmedUsers() {
        this.logger.log('Starting cleanup of unconfirmed users...');
        try {
            const { data: authUsers, error } = await this.supabaseService.listUnconfirmedUsers();
            if (error) {
                this.logger.error('Failed to list unconfirmed users from Supabase:', error.message);
                return;
            }
            if (!authUsers || authUsers.length === 0) {
                this.logger.log('No unconfirmed users found');
                return;
            }
            const now = new Date();
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
            let deletedCount = 0;
            for (const authUser of authUsers) {
                const createdAt = new Date(authUser.created_at);
                const timeSinceCreation = now.getTime() - createdAt.getTime();
                if (timeSinceCreation > TWENTY_FOUR_HOURS) {
                    this.logger.log(`Deleting unconfirmed user: ${authUser.id} (created at ${createdAt.toISOString()})`);
                    const { error: deleteError } = await this.supabaseService.deleteUser(authUser.id);
                    if (deleteError) {
                        this.logger.error(`Failed to delete user ${authUser.id} from Supabase:`, deleteError.message);
                        continue;
                    }
                    await this.prisma.user.deleteMany({
                        where: { id: authUser.id },
                    });
                    deletedCount++;
                }
            }
            this.logger.log(`Cleanup completed. Deleted ${deletedCount} unconfirmed users.`);
        }
        catch (error) {
            this.logger.error('Error during user cleanup:', error);
        }
    }
};
exports.UserCleanupService = UserCleanupService;
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserCleanupService.prototype, "cleanupUnconfirmedUsers", null);
exports.UserCleanupService = UserCleanupService = UserCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService])
], UserCleanupService);
//# sourceMappingURL=user-cleanup.service.js.map