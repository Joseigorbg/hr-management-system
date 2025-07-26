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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const create_setting_dto_1 = require("./dto/create-setting.dto");
const update_setting_dto_1 = require("./dto/update-setting.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    create(createSettingDto) {
        return this.settingsService.create(createSettingDto);
    }
    findAll(page, limit, category) {
        return this.settingsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, category);
    }
    getCategories() {
        return this.settingsService.getCategories();
    }
    getSettingsByCategory(category) {
        return this.settingsService.getSettingsByCategory(category);
    }
    async backup() {
        return this.settingsService.backup();
    }
    async restore(file) {
        const data = JSON.parse(file.buffer.toString());
        return this.settingsService.restore(data);
    }
    getPermissions() {
        return [
            { id: '1', name: 'Gerenciar Usuários', key: 'user_management' },
            { id: '2', name: 'Editar Configurações', key: 'settings_edit' },
        ];
    }
    getSystemSettings() {
        return this.settingsService.getSystemSettings();
    }
    getNotificationSettings() {
        return this.settingsService.getNotificationSettings();
    }
    getSecuritySettings() {
        return this.settingsService.getSecuritySettings();
    }
    initializeDefaultSettings() {
        return this.settingsService.initializeDefaultSettings();
    }
    bulkUpdate(settings) {
        return this.settingsService.bulkUpdate(settings);
    }
    findByKey(key) {
        return this.settingsService.findByKey(key);
    }
    updateByKey(key, body) {
        return this.settingsService.updateByKey(key, body.value);
    }
    findOne(id) {
        return this.settingsService.findOne(id);
    }
    update(id, updateSettingDto) {
        return this.settingsService.update(id, updateSettingDto);
    }
    remove(id) {
        return this.settingsService.remove(id);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova configuração' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Configuração criada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Configuração já existe' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_setting_dto_1.CreateSettingDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar configurações' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String, description: 'Filtrar por categoria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de configurações retornada com sucesso' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar categorias de configurações' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categorias retornadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar configurações por categoria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurações da categoria retornadas com sucesso' }),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSettingsByCategory", null);
__decorate([
    (0, common_1.Post)('backup'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar backup das configurações' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Backup criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro ao criar backup' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "backup", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('backup')),
    (0, swagger_1.ApiOperation)({ summary: 'Restaurar configurações de um backup' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Backup restaurado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro ao restaurar backup' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar permissões disponíveis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissões retornadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar configurações do sistema' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurações do sistema retornadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSystemSettings", null);
__decorate([
    (0, common_1.Get)('notification'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar configurações de notificação' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurações de notificação retornadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getNotificationSettings", null);
__decorate([
    (0, common_1.Get)('security'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar configurações de segurança' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurações de segurança retornadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSecuritySettings", null);
__decorate([
    (0, common_1.Post)('initialize'),
    (0, swagger_1.ApiOperation)({ summary: 'Inicializar configurações padrão' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Configurações padrão inicializadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "initializeDefaultSettings", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar múltiplas configurações' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurações atualizadas com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Get)('key/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar configuração por chave' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuração retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Configuração não encontrada' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "findByKey", null);
__decorate([
    (0, common_1.Patch)('key/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar configuração por chave' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuração atualizada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Configuração não encontrada' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateByKey", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar configuração por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuração retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Configuração não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar configuração' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuração atualizada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Configuração não encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Chave da configuração já existe' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_setting_dto_1.UpdateSettingDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover configuração' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuração removida com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Configuração não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "remove", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map