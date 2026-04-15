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
var LuckyPassService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuckyPassService = void 0;
const common_1 = require("@nestjs/common");
const lucky_pass_repository_1 = require("./lucky-pass.repository");
const raffles_repository_1 = require("../raffles/raffles.repository");
const lucky_pass_mapper_1 = require("./mappers/lucky-pass.mapper");
let LuckyPassService = LuckyPassService_1 = class LuckyPassService {
    constructor(luckyPassRepository, rafflesRepository) {
        this.luckyPassRepository = luckyPassRepository;
        this.rafflesRepository = rafflesRepository;
        this.logger = new common_1.Logger(LuckyPassService_1.name);
    }
    async findByUser(userId) {
        this.logger.debug(`Buscando lucky passes del usuario: ${userId}`);
        const passes = await this.luckyPassRepository.findByUser(userId, {
            raffle: true,
        });
        this.logger.debug(`Encontrados ${passes.length} lucky passes para el usuario ${userId}`);
        return passes.map((pass) => (0, lucky_pass_mapper_1.mapLuckyPassToDto)(pass));
    }
    async getSummary(userId) {
        this.logger.debug(`Obteniendo resumen de lucky passes para usuario: ${userId}`);
        const [total, active, used, winners,] = await Promise.all([
            this.luckyPassRepository.countByUserAndStatus(userId),
            this.luckyPassRepository.countByUserAndStatus(userId, 'active'),
            this.luckyPassRepository.countByUserAndStatus(userId, 'used'),
            this.luckyPassRepository.countWinnersByUser(userId),
        ]);
        this.logger.debug(`Resumen lucky passes usuario ${userId}: total=${total}, activos=${active}, ganadores=${winners}`);
        return {
            total,
            active,
            used,
            winners,
        };
    }
    async findById(id) {
        this.logger.debug(`Buscando lucky pass por ID: ${id}`);
        const pass = await this.luckyPassRepository.findUnique({ id }, { raffle: true });
        if (!pass) {
            this.logger.warn(`Lucky pass no encontrado: ${id}`);
            throw new common_1.NotFoundException(`Lucky pass con ID ${id} no encontrado`);
        }
        return (0, lucky_pass_mapper_1.mapLuckyPassToDto)(pass);
    }
    async findByRaffle(raffleId) {
        this.logger.debug(`Buscando lucky passes de rifa: ${raffleId}`);
        const passes = await this.luckyPassRepository.findByRaffle(raffleId, {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            },
        });
        return passes.map((pass) => (0, lucky_pass_mapper_1.mapLuckyPassToDto)(pass));
    }
    async checkAvailability(raffleId, ticketNumber) {
        const raffle = await this.rafflesRepository.findUnique({ id: raffleId });
        if (!raffle)
            return { available: false };
        if (ticketNumber < 1 || ticketNumber > raffle.maxTicketNumber)
            return { available: false };
        const existing = await this.luckyPassRepository.findByTicketNumber(raffleId, ticketNumber);
        return { available: existing === null };
    }
    async markAsWinner(id) {
        this.logger.debug(`Marcando lucky pass ${id} como ganador`);
        const pass = await this.luckyPassRepository.markAsWinner(id);
        this.logger.log(`Lucky pass ${id} marcado como ganador`);
        const passWithRaffle = await this.luckyPassRepository.findUnique({ id: pass.id }, { raffle: true });
        if (!passWithRaffle) {
            throw new common_1.NotFoundException('Error al recuperar el lucky pass actualizado');
        }
        return (0, lucky_pass_mapper_1.mapLuckyPassToDto)(passWithRaffle);
    }
};
exports.LuckyPassService = LuckyPassService;
exports.LuckyPassService = LuckyPassService = LuckyPassService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lucky_pass_repository_1.LuckyPassRepository,
        raffles_repository_1.RafflesRepository])
], LuckyPassService);
//# sourceMappingURL=lucky-pass.service.js.map