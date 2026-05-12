"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const users_controller_1 = require("./users.controller");
const auth_controller_1 = require("./auth.controller");
const users_service_1 = require("./users.service");
const auth_service_1 = require("./auth.service");
const supabase_module_1 = require("../../config/supabase.module");
const email_module_1 = require("../email/email.module");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const recaptcha_service_1 = require("../../common/services/recaptcha.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            supabase_module_1.SupabaseModule,
            email_module_1.EmailModule,
        ],
        controllers: [users_controller_1.UsersController, auth_controller_1.AuthController],
        providers: [users_service_1.UsersService, auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, recaptcha_service_1.RecaptchaService],
        exports: [users_service_1.UsersService, auth_service_1.AuthService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map