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
exports.CustomerOwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const raffles_repository_1 = require("../../raffles/raffles.repository");
let CustomerOwnershipGuard = class CustomerOwnershipGuard {
    constructor(rafflesRepository) {
        this.rafflesRepository = rafflesRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;
        const raffleId = params.raffleId || params.id;
        if (!user) {
            throw new common_1.ForbiddenException('Usuario no autenticado');
        }
        if (user.role !== 'customer') {
            throw new common_1.ForbiddenException('Acceso denegado: solo customers pueden acceder');
        }
        if (!raffleId) {
            return true;
        }
        const raffle = await this.rafflesRepository.findUnique({ id: raffleId }, { organization: true });
        const typedRaffle = raffle;
        if (!typedRaffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        const userDetails = await this.rafflesRepository.getUserById(user.id);
        if (!userDetails) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (userDetails.organizationId !== typedRaffle.organizationId) {
            throw new common_1.ForbiddenException('No puedes acceder a rifas que no pertenecen a tu organización');
        }
        return true;
    }
};
exports.CustomerOwnershipGuard = CustomerOwnershipGuard;
exports.CustomerOwnershipGuard = CustomerOwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [raffles_repository_1.RafflesRepository])
], CustomerOwnershipGuard);
//# sourceMappingURL=customer-ownership.guard.js.map