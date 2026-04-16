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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const supabase_service_1 = require("../../config/supabase.service");
const user_mapper_1 = require("./mappers/user.mapper");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, supabaseService) {
        this.prisma = prisma;
        this.supabaseService = supabaseService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone } = registerDto;
        const existingUser = await this.prisma.user.findFirst({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const { data: supabaseData, error: supabaseError } = await this.supabaseService.signUp(email.toLowerCase(), password);
        if (supabaseError) {
            throw new common_1.ConflictException(supabaseError.message);
        }
        if (!supabaseData.user) {
            throw new common_1.ConflictException('No se pudo crear el usuario en Supabase');
        }
        const user = await this.prisma.user.create({
            data: {
                id: supabaseData.user.id,
                email: email.toLowerCase(),
                firstName,
                lastName,
                phone: parseFloat(phone),
                role: 'customer',
            },
        });
        return {
            user: (0, user_mapper_1.mapUserToDto)(user),
            accessToken: supabaseData.session?.access_token || '',
            refreshToken: supabaseData.session?.refresh_token || '',
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const { data: supabaseData, error: supabaseError } = await this.supabaseService.signIn(email.toLowerCase(), password);
        if (supabaseError || !supabaseData.user) {
            throw new common_1.UnauthorizedException('Usuario y/o contraseña incorrectos');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: supabaseData.user.id },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado en el sistema');
        }
        if (user.status === client_1.UserStatus.blocked) {
            throw new common_1.UnauthorizedException('Usuario bloqueado');
        }
        return {
            user: (0, user_mapper_1.mapUserToDto)(user),
            accessToken: supabaseData.session?.access_token || '',
            refreshToken: supabaseData.session?.refresh_token || '',
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.status === client_1.UserStatus.blocked) {
            return null;
        }
        return user;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return (0, user_mapper_1.mapUserToDto)(user);
    }
    async updateProfile(userId, updateData) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (updateData.email && updateData.email.toLowerCase() !== user.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: { email: updateData.email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está en uso');
            }
        }
        const updateDataPrisma = {
            email: updateData.email?.toLowerCase() || user.email,
            firstName: updateData.firstName || user.firstName,
            lastName: updateData.lastName || user.lastName,
            phone: updateData.phone ? parseFloat(updateData.phone) : user.phone,
        };
        if (updateData.email) {
            const supabaseUpdates = {};
            supabaseUpdates.email = updateData.email.toLowerCase();
            const { error: supabaseError } = await this.supabaseService.updateUser(userId, supabaseUpdates);
            if (supabaseError) {
                throw new common_1.ConflictException('Error al actualizar en Supabase: ' + supabaseError.message);
            }
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateDataPrisma,
        });
        return (0, user_mapper_1.mapUserToDto)(updatedUser);
    }
    async refreshToken(refreshToken) {
        const { data, error } = await this.supabaseService.refreshToken(refreshToken);
        if (error || !data.session) {
            throw new common_1.UnauthorizedException('Token de refresco inválido');
        }
        return {
            accessToken: data.session.access_token,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map