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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const admin_service_1 = require("./admin.service");
const dto_1 = require("./dto");
const decorators_1 = require("../../common/decorators");
const roles_guard_1 = require("../users/guards/roles.guard");
const jobs_service_1 = require("../jobs/jobs.service");
let AdminController = AdminController_1 = class AdminController {
    constructor(adminService, jobsService) {
        this.adminService = adminService;
        this.jobsService = jobsService;
        this.logger = new common_1.Logger(AdminController_1.name);
    }
    async createRaffle(dto, adminId) {
        this.logger.log(`POST /admin/raffles - Admin: ${adminId}`);
        return this.adminService.createRaffle(adminId, dto);
    }
    async getAllRaffles() {
        this.logger.log('GET /admin/raffles');
        return this.adminService.getAllRaffles();
    }
    async updateRaffle(raffleId, dto) {
        this.logger.log(`PATCH /admin/raffles/${raffleId}`);
        return this.adminService.updateRaffle(raffleId, dto);
    }
    async updateRaffleStatus(raffleId, dto) {
        this.logger.log(`PATCH /admin/raffles/${raffleId}/status`);
        return this.adminService.updateRaffleStatus(raffleId, dto);
    }
    async getKpis() {
        this.logger.log('GET /admin/kpis');
        return this.adminService.getKpis();
    }
    async getAllUsers(skip, take) {
        this.logger.log('GET /admin/users');
        const skipNum = skip ? parseInt(skip, 10) : 0;
        const takeNum = take ? parseInt(take, 10) : 50;
        return this.adminService.getAllUsers(skipNum, takeNum);
    }
    async updateUserRole(userId, dto) {
        this.logger.log(`PATCH /admin/users/${userId}/role`);
        return this.adminService.updateUserRole(userId, dto);
    }
    async blockUser(userId, dto) {
        this.logger.log(`PATCH /admin/users/${userId}/block`);
        return this.adminService.updateUserStatus(userId, dto);
    }
    async getJobsStatus() {
        this.logger.log('GET /admin/jobs/status');
        return this.jobsService.getJobsStatus();
    }
    async runJobManually(jobName) {
        this.logger.log(`POST /admin/jobs/run/${jobName}`);
        return this.jobsService.runJobManually(jobName);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('raffles'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateRaffleDto, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createRaffle", null);
__decorate([
    (0, common_1.Get)('raffles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllRaffles", null);
__decorate([
    (0, common_1.Patch)('raffles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateRaffleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRaffle", null);
__decorate([
    (0, common_1.Patch)('raffles/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateRaffleStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRaffleStatus", null);
__decorate([
    (0, common_1.Get)('kpis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/block'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Get)('jobs/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getJobsStatus", null);
__decorate([
    (0, common_1.Post)('jobs/run/:jobName'),
    __param(0, (0, common_1.Param)('jobName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "runJobManually", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.admin, client_1.UserRole.operator])),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        jobs_service_1.JobsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map