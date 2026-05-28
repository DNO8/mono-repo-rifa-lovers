"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idempotent = Idempotent;
const common_1 = require("@nestjs/common");
const idempotency_guard_1 = require("../guards/idempotency.guard");
const idempotency_interceptor_1 = require("../interceptors/idempotency.interceptor");
function Idempotent() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(idempotency_guard_1.IdempotencyGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor));
}
//# sourceMappingURL=idempotent.decorator.js.map