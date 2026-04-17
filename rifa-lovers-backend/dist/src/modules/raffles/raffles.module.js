"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesModule = void 0;
const common_1 = require("@nestjs/common");
const raffles_controller_1 = require("./raffles.controller");
const raffles_service_1 = require("./raffles.service");
const raffles_repository_1 = require("./raffles.repository");
const raffle_scheduler_service_1 = require("./raffle-scheduler.service");
const customer_ownership_guard_1 = require("../users/guards/customer-ownership.guard");
let RafflesModule = class RafflesModule {
};
exports.RafflesModule = RafflesModule;
exports.RafflesModule = RafflesModule = __decorate([
    (0, common_1.Module)({
        controllers: [raffles_controller_1.RafflesController],
        providers: [raffles_service_1.RafflesService, raffles_repository_1.RafflesRepository, raffle_scheduler_service_1.RaffleSchedulerService, customer_ownership_guard_1.CustomerOwnershipGuard],
        exports: [raffles_service_1.RafflesService, raffles_repository_1.RafflesRepository, raffle_scheduler_service_1.RaffleSchedulerService, customer_ownership_guard_1.CustomerOwnershipGuard],
    })
], RafflesModule);
//# sourceMappingURL=raffles.module.js.map