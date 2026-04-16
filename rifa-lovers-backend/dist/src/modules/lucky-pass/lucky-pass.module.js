"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuckyPassModule = void 0;
const common_1 = require("@nestjs/common");
const lucky_pass_controller_1 = require("./lucky-pass.controller");
const lucky_pass_service_1 = require("./lucky-pass.service");
const lucky_pass_repository_1 = require("./lucky-pass.repository");
const raffles_repository_1 = require("../raffles/raffles.repository");
let LuckyPassModule = class LuckyPassModule {
};
exports.LuckyPassModule = LuckyPassModule;
exports.LuckyPassModule = LuckyPassModule = __decorate([
    (0, common_1.Module)({
        controllers: [lucky_pass_controller_1.LuckyPassController],
        providers: [lucky_pass_service_1.LuckyPassService, lucky_pass_repository_1.LuckyPassRepository, raffles_repository_1.RafflesRepository],
        exports: [lucky_pass_service_1.LuckyPassService, lucky_pass_repository_1.LuckyPassRepository],
    })
], LuckyPassModule);
//# sourceMappingURL=lucky-pass.module.js.map