"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawModule = void 0;
const common_1 = require("@nestjs/common");
const draw_controller_1 = require("./draw.controller");
const draw_service_1 = require("./draw.service");
const customer_draw_controller_1 = require("./customer-draw.controller");
const customer_draw_service_1 = require("./customer-draw.service");
const notifications_module_1 = require("../notifications/notifications.module");
const raffles_module_1 = require("../raffles/raffles.module");
let DrawModule = class DrawModule {
};
exports.DrawModule = DrawModule;
exports.DrawModule = DrawModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule, raffles_module_1.RafflesModule],
        controllers: [draw_controller_1.DrawController, customer_draw_controller_1.CustomerDrawController],
        providers: [draw_service_1.DrawService, customer_draw_service_1.CustomerDrawService],
        exports: [draw_service_1.DrawService, customer_draw_service_1.CustomerDrawService],
    })
], DrawModule);
//# sourceMappingURL=draw.module.js.map