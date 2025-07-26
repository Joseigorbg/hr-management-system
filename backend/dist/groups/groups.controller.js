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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const groups_service_1 = require("./groups.service");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const create_groups_dto_1 = require("./dto/create-groups.dto");
const add_user_to_group_dto_1 = require("./dto/add-user-to-group.dto");
let GroupsController = class GroupsController {
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    async findAll() {
        try {
            return await this.groupsService.findAll();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao carregar grupos', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(body) {
        console.log('Corpo recebido em POST /api/groups:', body);
        try {
            return await this.groupsService.create(body.name, body.description);
        }
        catch (error) {
            console.error('Erro no controlador create:', error);
            throw new common_1.HttpException(error.message || 'Erro ao criar grupo', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addUserToGroup(body) {
        try {
            return await this.groupsService.addUserToGroup(body.groupId, body.userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao adicionar usuário ao grupo', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os grupos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de grupos retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro interno do servidor' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo grupo' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Grupo criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro interno do servidor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_groups_dto_1.CreateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('add-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar usuário a um grupo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuário adicionado ao grupo com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo ou usuário não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Usuário já está no grupo' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro interno do servidor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_user_to_group_dto_1.AddUserToGroupDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "addUserToGroup", null);
exports.GroupsController = GroupsController = __decorate([
    (0, swagger_1.ApiTags)('groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('api/groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map