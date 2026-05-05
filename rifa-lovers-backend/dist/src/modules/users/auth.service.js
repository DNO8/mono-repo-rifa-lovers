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
        const { email, password, firstName, lastName, phone, address } = registerDto;
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
                address,
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
        if (!supabaseData.user.email_confirmed_at) {
            throw new common_1.UnauthorizedException('Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
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
        if (updateData.newPassword) {
            if (!updateData.currentPassword) {
                throw new common_1.UnauthorizedException('Debes ingresar tu contraseña actual para cambiarla');
            }
            if (!user.email) {
                throw new common_1.UnauthorizedException('Usuario sin email registrado');
            }
            const { error: verifyError } = await this.supabaseService.signIn(user.email, updateData.currentPassword);
            if (verifyError) {
                throw new common_1.UnauthorizedException('La contraseña actual es incorrecta');
            }
        }
        const updateDataPrisma = {
            email: updateData.email?.toLowerCase() || user.email,
            firstName: updateData.firstName || user.firstName,
            lastName: updateData.lastName || user.lastName,
            phone: this.parsePhone(updateData.phone, user.phone),
        };
        const supabaseUpdates = {};
        if (updateData.email) {
            supabaseUpdates.email = updateData.email.toLowerCase();
        }
        if (updateData.newPassword) {
            supabaseUpdates.password = updateData.newPassword;
        }
        if (supabaseUpdates.email || supabaseUpdates.password) {
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
    parsePhone(phone, fallback = null) {
        if (phone === undefined || phone === null || phone === '')
            return fallback ?? undefined;
        const cleaned = phone.replace(/[^\d]/g, '');
        if (!cleaned)
            return fallback ?? undefined;
        const parsed = parseFloat(cleaned);
        if (isNaN(parsed))
            return fallback ?? undefined;
        return parsed;
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