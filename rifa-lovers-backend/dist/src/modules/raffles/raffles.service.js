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
var RafflesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesService = void 0;
const common_1 = require("@nestjs/common");
const raffles_repository_1 = require("./raffles.repository");
const entities_1 = require("./entities");
let RafflesService = RafflesService_1 = class RafflesService {
    constructor(rafflesRepository) {
        this.rafflesRepository = rafflesRepository;
        this.logger = new common_1.Logger(RafflesService_1.name);
    }
    async findActive() {
        this.logger.debug('Buscando rifa activa');
        const raffle = await this.rafflesRepository.findActiveWithProgress();
        if (!raffle) {
            this.logger.debug('No se encontró rifa activa');
            return null;
        }
        const raffleEntity = new entities_1.RaffleEntity({
            id: raffle.id,
            organizationId: raffle.organizationId,
            title: raffle.title,
            description: raffle.description,
            goalPacks: raffle.goalPacks,
            maxTicketNumber: raffle.maxTicketNumber,
            status: raffle.status,
            startDate: raffle.startDate,
            endDate: raffle.endDate,
            createdAt: raffle.createdAt,
            updatedAt: raffle.updatedAt,
        });
        this.logger.debug(`Rifa activa encontrada: ${raffleEntity.id}`);
        return {
            id: raffleEntity.id,
            title: raffleEntity.title,
            description: raffleEntity.description,
            goalPacks: raffleEntity.goalPacks,
            maxTicketNumber: raffleEntity.maxTicketNumber,
            status: raffleEntity.status,
            createdAt: raffleEntity.createdAt.toISOString(),
            endDate: raffleEntity.endDate ? raffleEntity.endDate.toISOString() : null,
            milestones: raffle.milestones?.map(m => ({
                id: m.id,
                name: m.name,
                requiredPacks: m.requiredPacks,
                sortOrder: m.sortOrder,
                isUnlocked: (raffle.progress?.packsSold ?? 0) >= m.requiredPacks,
                prizes: m.prizes?.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    type: p.type,
                })) || [],
            })) || [],
        };
    }
    async getActiveProgress() {
        this.logger.debug('Obteniendo progreso de rifa activa');
        const raffle = await this.rafflesRepository.findActiveWithProgress();
        if (!raffle) {
            this.logger.debug('No hay rifa activa, retornando progreso vacío');
            return {
                raffleId: '',
                packsSold: 0,
                revenueTotal: 0,
                percentageToGoal: 0,
            };
        }
        const progress = raffle.progress;
        this.logger.debug(`Progreso rifa ${raffle.id}: ${progress?.packsSold ?? 0} packs vendidos`);
        const packsSold = progress?.packsSold ?? 0;
        const percentageToGoal = raffle.goalPacks > 0 ? Math.min((packsSold / raffle.goalPacks) * 100, 100) : 0;
        return {
            raffleId: raffle.id,
            packsSold,
            revenueTotal: progress?.revenueTotal?.toNumber() ?? 0,
            percentageToGoal,
        };
    }
    async findById(id) {
        this.logger.debug(`Buscando rifa por ID: ${id}`);
        const raffle = await this.rafflesRepository.findUnique({ id }, {
            progress: true,
            _count: {
                select: {
                    purchases: true,
                    luckyPasses: true,
                },
            },
        });
        if (!raffle) {
            this.logger.warn(`Rifa no encontrada: ${id}`);
            throw new common_1.NotFoundException(`Rifa con ID ${id} no encontrada`);
        }
        return {
            id: raffle.id,
            title: raffle.title,
            description: raffle.description,
            goalPacks: raffle.goalPacks,
            maxTicketNumber: raffle.maxTicketNumber,
            status: raffle.status,
            createdAt: raffle.createdAt.toISOString(),
            endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
        };
    }
    async findByStatus(status) {
        this.logger.debug(`Buscando rifas con estado: ${status}`);
        const raffles = await this.rafflesRepository.findByStatus(status);
        return raffles.map((raffle) => ({
            id: raffle.id,
            title: raffle.title,
            description: raffle.description,
            goalPacks: raffle.goalPacks,
            maxTicketNumber: raffle.maxTicketNumber,
            status: raffle.status,
            createdAt: raffle.createdAt.toISOString(),
            endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
        }));
    }
};
exports.RafflesService = RafflesService;
exports.RafflesService = RafflesService = RafflesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [raffles_repository_1.RafflesRepository])
], RafflesService);
//# sourceMappingURL=raffles.service.js.map