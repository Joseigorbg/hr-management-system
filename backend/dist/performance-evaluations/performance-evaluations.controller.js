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
exports.PerformanceEvaluationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const performance_evaluations_service_1 = require("./performance-evaluations.service");
const create_performance_evaluation_dto_1 = require("./dto/create-performance-evaluation.dto");
const update_performance_evaluation_dto_1 = require("./dto/update-performance-evaluation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const class_validator_1 = require("class-validator");
let PerformanceEvaluationsController = class PerformanceEvaluationsController {
    constructor(performanceEvaluationsService) {
        this.performanceEvaluationsService = performanceEvaluationsService;
    }
    async create(createPerformanceEvaluationDto) {
        try {
            console.log('Recebido DTO para criação no controlador:', JSON.stringify(createPerformanceEvaluationDto, null, 2));
            return await this.performanceEvaluationsService.create(createPerformanceEvaluationDto);
        }
        catch (error) {
            console.error('Erro no controlador ao criar avaliação:', {
                message: error.message,
                stack: error.stack,
                dto: JSON.stringify(createPerformanceEvaluationDto, null, 2),
                name: error.name,
                response: error.response ? JSON.stringify(error.response, null, 2) : 'Sem response',
            });
            if (Array.isArray(error) && error.every((e) => e instanceof class_validator_1.ValidationError)) {
                throw new common_1.BadRequestException({
                    message: 'Dados inválidos fornecidos',
                    errors: error.map((e) => ({
                        property: e.property,
                        constraints: e.constraints,
                    })),
                });
            }
            throw new common_1.BadRequestException(error.message || 'Erro ao criar avaliação. Verifique os dados fornecidos.');
        }
    }
    findAll(page, limit, userId, evaluatorId, period) {
        return this.performanceEvaluationsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, userId, evaluatorId, period);
    }
    findByUser(userId, page, limit) {
        return this.performanceEvaluationsService.getEvaluationsByUser(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    findByEvaluator(evaluatorId, page, limit) {
        return this.performanceEvaluationsService.getEvaluationsByEvaluator(evaluatorId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    findByPeriod(period, page, limit) {
        return this.performanceEvaluationsService.getEvaluationsByPeriod(period, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    findOne(id) {
        return this.performanceEvaluationsService.findOne(id);
    }
    async update(id, updatePerformanceEvaluationDto) {
        try {
            console.log('Recebido DTO para atualização no controlador:', JSON.stringify(updatePerformanceEvaluationDto, null, 2));
            return await this.performanceEvaluationsService.update(id, updatePerformanceEvaluationDto);
        }
        catch (error) {
            console.error('Erro no controlador ao atualizar avaliação:', {
                message: error.message,
                stack: error.stack,
                dto: JSON.stringify(updatePerformanceEvaluationDto, null, 2),
                name: error.name,
            });
            if (Array.isArray(error) && error.every((e) => e instanceof class_validator_1.ValidationError)) {
                throw new common_1.BadRequestException({
                    message: 'Dados inválidos fornecidos',
                    errors: error.map((e) => ({
                        property: e.property,
                        constraints: e.constraints,
                    })),
                });
            }
            throw new common_1.BadRequestException(error.message || 'Erro ao atualizar avaliação. Verifique os dados fornecidos.');
        }
    }
    async approve(id, req) {
        try {
            return await this.performanceEvaluationsService.approveEvaluation(id, req.user.id);
        }
        catch (error) {
            console.error('Erro no controlador ao aprovar avaliação:', {
                message: error.message,
                stack: error.stack,
                id,
                approverId: req.user.id,
            });
            throw error;
        }
    }
    async remove(id) {
        try {
            return await this.performanceEvaluationsService.remove(id);
        }
        catch (error) {
            console.error('Erro no controlador ao remover avaliação:', {
                message: error.message,
                stack: error.stack,
                id,
            });
            throw error;
        }
    }
};
exports.PerformanceEvaluationsController = PerformanceEvaluationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova avaliação de desempenho' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Avaliação criada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário ou avaliador não encontrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_performance_evaluation_dto_1.CreatePerformanceEvaluationDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar avaliações de desempenho' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, description: 'Filtrar por usuário' }),
    (0, swagger_1.ApiQuery)({ name: 'evaluatorId', required: false, type: String, description: 'Filtrar por avaliador' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, type: String, description: 'Filtrar por período' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de avaliações retornada com sucesso' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('evaluatorId')),
    __param(4, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceEvaluationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar avaliações por usuário' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliações do usuário retornadas com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceEvaluationsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('evaluator/:evaluatorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar avaliações por avaliador' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliações do avaliador retornadas com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Avaliador não encontrado' }),
    __param(0, (0, common_1.Param)('evaluatorId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceEvaluationsController.prototype, "findByEvaluator", null);
__decorate([
    (0, common_1.Get)('period/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar avaliações por período' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliações do período retornadas com sucesso' }),
    __param(0, (0, common_1.Param)('period')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceEvaluationsController.prototype, "findByPeriod", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar avaliação por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliação retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Avaliação não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceEvaluationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar avaliação de desempenho' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliação atualizada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Avaliação não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_performance_evaluation_dto_1.UpdatePerformanceEvaluationDto]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar avaliação de desempenho' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliação aprovada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Usuário não tem permissão para aprovar' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Avaliação não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover avaliação de desempenho' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avaliação removida com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Avaliação não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceEvaluationsController.prototype, "remove", null);
exports.PerformanceEvaluationsController = PerformanceEvaluationsController = __decorate([
    (0, swagger_1.ApiTags)('performance-evaluations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('performance-evaluations'),
    __metadata("design:paramtypes", [performance_evaluations_service_1.PerformanceEvaluationsService])
], PerformanceEvaluationsController);
//# sourceMappingURL=performance-evaluations.controller.js.map