"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketReservationsModule = void 0;
const common_1 = require("@nestjs/common");
const ticket_reservations_controller_1 = require("./ticket-reservations.controller");
const ticket_reservations_service_1 = require("./ticket-reservations.service");
const ticket_reservations_repository_1 = require("./ticket-reservations.repository");
const prisma_service_1 = require("../../database/prisma.service");
let TicketReservationsModule = class TicketReservationsModule {
};
exports.TicketReservationsModule = TicketReservationsModule;
exports.TicketReservationsModule = TicketReservationsModule = __decorate([
    (0, common_1.Module)({
        controllers: [ticket_reservations_controller_1.TicketReservationsController],
        providers: [ticket_reservations_service_1.TicketReservationsService, ticket_reservations_repository_1.TicketReservationsRepository, prisma_service_1.PrismaService],
        exports: [ticket_reservations_service_1.TicketReservationsService, ticket_reservations_repository_1.TicketReservationsRepository],
    })
], TicketReservationsModule);
//# sourceMappingURL=ticket-reservations.module.js.map