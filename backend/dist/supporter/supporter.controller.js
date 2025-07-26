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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupporterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supporter_service_1 = require("./supporter.service");
const create_supporter_dto_1 = require("./dto/create-supporter.dto");
const update_supporter_dto_1 = require("./dto/update-supporter.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const common_2 = require("@nestjs/common");
let SupporterController = class SupporterController {
    constructor(supporterService) {
        this.supporterService = supporterService;
    }
    async findAll(page = '1', limit = '10', search, status) {
        return this.supporterService.findAll(Number(page), Number(limit), search, status);
    }
    async findOne(id) {
        const supporter = await this.supporterService.findOne(id);
        if (!supporter) {
            throw new common_2.NotFoundException('Apoiador não encontrado');
        }
        return supporter;
    }
    async create(createSupporterDto) {
        return this.supporterService.create(createSupporterDto);
    }
    async update(id, updateSupporterDto) {
        return this.supporterService.update(id, updateSupporterDto);
    }
    async delete(id) {
        return this.supporterService.delete(id);
    }
};
exports.SupporterController = SupporterController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os apoiadores' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: '1' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: '10' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, example: 'João' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, example: 'active' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SupporterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter apoiador por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupporterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo apoiador' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supporter_dto_1.CreateSupporterDto]),
    __metadata("design:returntype", Promise)
], SupporterController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar apoiador' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_supporter_dto_1.UpdateSupporterDto]),
    __metadata("design:returntype", Promise)
], SupporterController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir apoiador' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupporterController.prototype, "delete", null);
exports.SupporterController = SupporterController = __decorate([
    (0, swagger_1.ApiTags)('supporters'),
    (0, common_1.Controller)('api/v1/supporter'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [supporter_service_1.SupporterService])
], SupporterController);
//# sourceMappingURL=supporter.controller.js.map