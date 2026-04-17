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
var CustomerDrawService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDrawService = void 0;
const common_1 = require("@nestjs/common");
const draw_service_1 = require("./draw.service");
const raffles_repository_1 = require("../raffles/raffles.repository");
let CustomerDrawService = CustomerDrawService_1 = class CustomerDrawService {
    constructor(drawService, rafflesRepository) {
        this.drawService = drawService;
        this.rafflesRepository = rafflesRepository;
        this.logger = new common_1.Logger(CustomerDrawService_1.name);
    }
    async checkCustomerDrawAvailability(raffleId, customerUserId) {
        this.logger.debug(`Customer ${customerUserId} verificando disponibilidad de sorteo para rifa ${raffleId}`);
        const raffle = await this.rafflesRepository.findUnique({ id: raffleId });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        await this.validateCustomerOwnership(raffleId, customerUserId);
        if (raffle.status !== 'closed') {
            return {
                canDraw: false,
                reason: `La rifa debe estar cerrada (estado actual: ${raffle.status})`,
                participants: [],
                prizesCount: 0,
                activePassesCount: 0,
            };
        }
        const existingWinners = await this.drawService.getWinnersCount(raffleId);
        if (existingWinners > 0) {
            return {
                canDraw: false,
                reason: 'El sorteo ya ha sido ejecutado',
                participants: [],
                prizesCount: 0,
                activePassesCount: 0,
            };
        }
        const participants = await this.getUniqueParticipants(raffleId);
        const prizesCount = await this.drawService.getUnlockedPrizesCount(raffleId);
        const activePassesCount = participants.reduce((total, p) => total + p.luckyPassIds.length, 0);
        if (participants.length === 0) {
            return {
                canDraw: false,
                reason: 'No hay participantes en la rifa',
                participants: [],
                prizesCount: 0,
                activePassesCount: 0,
            };
        }
        if (prizesCount === 0) {
            return {
                canDraw: false,
                reason: 'No hay premios desbloqueados',
                participants,
                prizesCount: 0,
                activePassesCount,
            };
        }
        return {
            canDraw: true,
            participants,
            prizesCount,
            activePassesCount,
        };
    }
    async executeCustomerDraw(raffleId, customerUserId) {
        this.logger.log(`Customer ${customerUserId} ejecutando sorteo para rifa ${raffleId}`);
        const availability = await this.checkCustomerDrawAvailability(raffleId, customerUserId);
        if (!availability.canDraw) {
            throw new common_1.BadRequestException(availability.reason);
        }
        const drawResult = await this.drawService.executeDraw(raffleId, customerUserId);
        const winners = await Promise.all((drawResult.winners || []).map(async (winner) => {
            const user = await this.getUserDetails(winner.userId);
            return {
                userId: winner.userId,
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                prizeId: winner.prizeId,
                prizeName: winner.prizeName,
                luckyPassId: winner.luckyPassId,
            };
        }));
        const discarded = await Promise.all((drawResult.discarded || []).map(async (discarded) => {
            const user = await this.getUserDetails(discarded.userId);
            return {
                userId: discarded.userId,
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                luckyPassId: discarded.luckyPassId,
            };
        }));
        return { winners, discarded };
    }
    async validateCustomerOwnership(raffleId, customerUserId) {
        const raffleWithOrg = await this.rafflesRepository.findUnique({ id: raffleId }, { organization: true });
        if (!raffleWithOrg) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        const customerUser = await this.getUserDetails(customerUserId);
        if (!customerUser) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (customerUser.role !== 'customer') {
            throw new common_1.ForbiddenException('Solo los customers pueden realizar sorteos');
        }
        if (customerUser.organizationId !== raffleWithOrg.organizationId) {
            throw new common_1.ForbiddenException('No puedes realizar sorteos de rifas que no pertenecen a tu organización');
        }
        return customerUser;
    }
    async getUniqueParticipants(raffleId) {
        const participants = await this.rafflesRepository.getUniqueParticipants(raffleId);
        return participants;
    }
    async getUserDetails(userId) {
        const user = await this.rafflesRepository.getUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`Usuario ${userId} no encontrado`);
        }
        return user;
    }
};
exports.CustomerDrawService = CustomerDrawService;
exports.CustomerDrawService = CustomerDrawService = CustomerDrawService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [draw_service_1.DrawService,
        raffles_repository_1.RafflesRepository])
], CustomerDrawService);
//# sourceMappingURL=customer-draw.service.js.map