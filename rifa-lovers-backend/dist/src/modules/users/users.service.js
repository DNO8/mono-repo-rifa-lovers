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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const resend_service_1 = require("../email/resend.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, resendService, config) {
        this.prisma = prisma;
        this.resendService = resendService;
        this.config = config;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findFirst({
            where: { email: email.toLowerCase() },
        });
    }
    async updateRole(userId, role) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        if ((role === 'admin' || role === 'operator') && user.email) {
            try {
                void this.resendService.sendPromotedRoleEmail({
                    toEmail: user.email,
                    toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Usuario',
                    role,
                    frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
                });
            }
            catch (err) {
                this.logger.error(`Error enviando email de rol promovido: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        return user;
    }
    async blockUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'blocked' },
        });
    }
    async unblockUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'active' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        resend_service_1.ResendService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map