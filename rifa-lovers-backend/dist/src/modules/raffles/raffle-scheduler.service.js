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
exports.RaffleSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const raffles_repository_1 = require("./raffles.repository");
let RaffleSchedulerService = class RaffleSchedulerService {
    constructor(rafflesRepository) {
        this.rafflesRepository = rafflesRepository;
    }
    async closeExpiredRaffles() {
        const errors = [];
        let closed = 0;
        try {
            const expiredRaffles = await this.rafflesRepository.findActiveExpiredRaffles();
            for (const raffle of expiredRaffles) {
                try {
                    await this.rafflesRepository.updateStatus(raffle.id, 'closed');
                    closed++;
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    const errorMsg = `Error cerrando raffle ${raffle.id}: ${message}`;
                    errors.push(errorMsg);
                }
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            const errorMsg = `Error buscando rifas expiradas: ${message}`;
            errors.push(errorMsg);
        }
        return { closed, errors };
    }
};
exports.RaffleSchedulerService = RaffleSchedulerService;
exports.RaffleSchedulerService = RaffleSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [raffles_repository_1.RafflesRepository])
], RaffleSchedulerService);
//# sourceMappingURL=raffle-scheduler.service.js.map