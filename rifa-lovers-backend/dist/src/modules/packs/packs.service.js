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
var PacksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacksService = void 0;
const common_1 = require("@nestjs/common");
const packs_repository_1 = require("./packs.repository");
const pack_mapper_1 = require("./mappers/pack.mapper");
let PacksService = PacksService_1 = class PacksService {
    constructor(packsRepository) {
        this.packsRepository = packsRepository;
        this.logger = new common_1.Logger(PacksService_1.name);
    }
    async findAll() {
        this.logger.debug('Buscando todos los packs');
        const packs = await this.packsRepository.findMany({ isPreSale: false }, { price: 'asc' });
        this.logger.debug(`Encontrados ${packs.length} packs`);
        return packs.map(pack_mapper_1.mapPackToDto);
    }
    async findById(id) {
        this.logger.debug(`Buscando pack por ID: ${id}`);
        const pack = await this.packsRepository.findUnique({ id });
        if (!pack) {
            this.logger.warn(`Pack no encontrado: ${id}`);
            throw new common_1.NotFoundException(`Pack con ID ${id} no encontrado`);
        }
        return (0, pack_mapper_1.mapPackToDto)(pack);
    }
};
exports.PacksService = PacksService;
exports.PacksService = PacksService = PacksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [packs_repository_1.PacksRepository])
], PacksService);
//# sourceMappingURL=packs.service.js.map