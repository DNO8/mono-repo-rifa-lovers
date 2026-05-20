"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const isProduction = process.env.NODE_ENV === 'production';
        let status;
        let message;
        let error;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            message = exception.message;
            error = exception.name;
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (exception.code === 'P2002') {
                const fields = exception.meta?.target?.join(', ') || 'campo';
                status = common_1.HttpStatus.CONFLICT;
                message = `Ya existe un registro con ese ${fields}. Intenta con otro valor.`;
                error = 'ConflictError';
            }
            else {
                status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                message = 'Error de base de datos. Intenta más tarde.';
                error = 'DatabaseError';
            }
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';
        }
        const errorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request['requestId'] || crypto.randomUUID(),
        };
        if (!isProduction) {
            if (exception instanceof common_1.HttpException) {
                const exceptionResponse = exception.getResponse();
                if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                    errorResponse.details = exceptionResponse;
                }
            }
            if (exception instanceof Error) {
                errorResponse.stack = exception.stack;
            }
        }
        if (status >= 500) {
            this.logger.error(`[${errorResponse.requestId}] ${request.method} ${request.url} - ${status}: ${message}`, exception instanceof Error ? exception.stack : undefined);
        }
        else if (status >= 400) {
            this.logger.warn(`[${errorResponse.requestId}] ${request.method} ${request.url} - ${status}: ${message}`);
        }
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map