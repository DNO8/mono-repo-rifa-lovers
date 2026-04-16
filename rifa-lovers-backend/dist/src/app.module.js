"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./modules/users/users.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
const lucky_pass_module_1 = require("./modules/lucky-pass/lucky-pass.module");
const raffles_module_1 = require("./modules/raffles/raffles.module");
const packs_module_1 = require("./modules/packs/packs.module");
const payments_module_1 = require("./modules/payments/payments.module");
const draw_module_1 = require("./modules/draw/draw.module");
const testimonials_module_1 = require("./modules/testimonials/testimonials.module");
const admin_module_1 = require("./modules/admin/admin.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const throttler_config_1 = require("./config/throttler.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot(throttler_config_1.throttlerConfig),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
                    redact: ['req.headers.authorization', 'req.headers.cookie'],
                },
            }),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            users_module_1.UsersModule,
            purchases_module_1.PurchasesModule,
            lucky_pass_module_1.LuckyPassModule,
            raffles_module_1.RafflesModule,
            packs_module_1.PacksModule,
            payments_module_1.PaymentsModule,
            draw_module_1.DrawModule,
            testimonials_module_1.TestimonialsModule,
            admin_module_1.AdminModule,
            jobs_module_1.JobsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map