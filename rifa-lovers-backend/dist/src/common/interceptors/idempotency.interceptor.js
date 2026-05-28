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
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../../database/prisma.service");
const IDEMPOTENCY_TTL_MINUTES = 30;
let IdempotencyInterceptor = class IdempotencyInterceptor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const key = request.idempotencyKey;
        const cached = request.idempotencyCache;
        if (cached) {
            return (0, rxjs_1.of)(this.replay(cached));
        }
        if (!key) {
            return next.handle();
        }
        const method = request.method;
        const endpoint = request.url;
        return next.handle().pipe((0, rxjs_1.tap)(async (data) => {
            const response = context.switchToHttp().getResponse();
            const statusCode = response.statusCode;
            if (statusCode >= 200 && statusCode < 300) {
                const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MINUTES * 60_000);
                try {
                    await this.prisma.idempotencyRecord.upsert({
                        where: { key },
                        create: {
                            key,
                            endpoint,
                            httpMethod: method,
                            statusCode,
                            responseBody: data ? JSON.stringify(data) : null,
                            expiresAt,
                        },
                        update: {
                            endpoint,
                            httpMethod: method,
                            statusCode,
                            responseBody: data ? JSON.stringify(data) : null,
                            expiresAt,
                        },
                    });
                }
                catch {
                }
            }
        }));
    }
    replay(cached) {
        if (cached.responseBody) {
            try {
                return JSON.parse(cached.responseBody);
            }
            catch {
                return cached.responseBody;
            }
        }
        return undefined;
    }
};
exports.IdempotencyInterceptor = IdempotencyInterceptor;
exports.IdempotencyInterceptor = IdempotencyInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdempotencyInterceptor);
//# sourceMappingURL=idempotency.interceptor.js.map