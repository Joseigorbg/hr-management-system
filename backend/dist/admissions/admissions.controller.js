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
exports.AdmissionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const admissions_service_1 = require("./admissions.service");
const create_admission_dto_1 = require("./dto/create-admission.dto");
const update_admission_dto_1 = require("./dto/update-admission.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../auth/decorators/auth-user.decorator");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
let AdmissionsController = class AdmissionsController {
    constructor(admissionsService) {
        this.admissionsService = admissionsService;
    }
    async create(createAdmissionDto, files) {
        try {
            console.log('DTO recebido no controller para criação:', createAdmissionDto);
            console.log('Arquivos recebidos:', files?.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })));
            return await this.admissionsService.create(createAdmissionDto, files);
        }
        catch (error) {
            console.error('Erro ao criar admissão:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.BadRequestException({
                message: 'Erro ao criar admissão',
                details: error.message || 'Erro desconhecido',
            });
        }
    }
    async uploadDocument(admissionId, files, user) {
        try {
            if (!files || files.length === 0) {
                throw new common_1.BadRequestException('Nenhum arquivo enviado');
            }
            console.log('Upload de documentos:', { admissionId, files: files.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })), uploadedBy: user.id });
            return await this.admissionsService.uploadDocuments(admissionId, files, user.id);
        }
        catch (error) {
            console.error('Erro ao enviar documentos:', error);
            throw error;
        }
    }
    async deleteDocument(admissionId, documentId) {
        try {
            return await this.admissionsService.deleteDocument(documentId);
        }
        catch (error) {
            console.error('Erro ao remover documento:', error);
            throw error;
        }
    }
    async findAll(page, limit, status, search) {
        try {
            return await this.admissionsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, status, search);
        }
        catch (error) {
            console.error('Erro ao listar admissões:', error);
            throw new common_1.BadRequestException({
                message: 'Erro ao listar admissões',
                details: error.message || 'Erro desconhecido',
            });
        }
    }
    async findByDateRange(startDate, endDate, page, limit) {
        try {
            return await this.admissionsService.getAdmissionsByDateRange(startDate, endDate, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
        }
        catch (error) {
            console.error('Erro ao buscar admissões por período:', error);
            throw new common_1.BadRequestException({
                message: 'Erro ao buscar admissões por período',
                details: error.message || 'Erro desconhecido',
            });
        }
    }
    async findByUser(userId) {
        try {
            return await this.admissionsService.findByUser(userId);
        }
        catch (error) {
            console.error('Erro ao buscar admissão por usuário:', error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            return await this.admissionsService.findOne(id);
        }
        catch (error) {
            console.error('Erro ao buscar admissão:', error);
            throw error;
        }
    }
    async update(id, updateAdmissionDto, files, user) {
        try {
            console.log('Dados recebidos no controller para atualização:', {
                id,
                updateAdmissionDto,
                files: files?.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })),
                userId: user?.id,
            });
            return await this.admissionsService.update(id, updateAdmissionDto, files);
        }
        catch (error) {
            console.error('Erro ao atualizar admissão:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.BadRequestException({
                message: 'Erro ao atualizar admissão',
                details: error.message || 'Erro desconhecido',
            });
        }
    }
    async terminate(id, body) {
        try {
            return await this.admissionsService.terminate(id, body.terminationDate, body.terminationReason);
        }
        catch (error) {
            console.error('Erro ao terminar admissão:', error);
            throw error;
        }
    }
    async reactivate(id) {
        try {
            return await this.admissionsService.reactivate(id);
        }
        catch (error) {
            console.error('Erro ao reativar admissão:', error);
            throw error;
        }
    }
    async remove(id) {
        try {
            return await this.admissionsService.remove(id);
        }
        catch (error) {
            console.error('Erro ao remover admissão:', error);
            throw error;
        }
    }
};
exports.AdmissionsController = AdmissionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('documents', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = (0, path_1.join)(__dirname, '..', '..', 'Uploads', 'documents');
                (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileExt = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${fileExt}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
            }
            cb(null, true);
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova admissão' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admissão criada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário, cargo ou departamento não encontrado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admission_dto_1.CreateAdmissionDto, Array]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('documents', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = (0, path_1.join)(__dirname, '..', '..', 'Uploads', 'documents');
                (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileExt = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${fileExt}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
            }
            cb(null, true);
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar documento para admissão' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Documento enviado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Arquivo inválido' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Delete)(':id/documents/:documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover documento de admissão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documento removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Documento ou admissão não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar admissões' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, description: 'Filtrar por status' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Termo de busca' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de admissões retornada com sucesso' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar admissões por período' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: String, description: 'Data inicial (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: String, description: 'Data final (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limite por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissões do período retornadas com sucesso' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar admissão por usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissão do usuário retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão não encontrada' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar admissão por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissão retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('documents', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = (0, path_1.join)(__dirname, '..', '..', 'Uploads', 'documents');
                (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileExt = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${fileExt}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
            }
            cb(null, true);
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar admissão' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissão atualizada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão, cargo ou departamento não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admission_dto_1.UpdateAdmissionDto, Array, Object]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/terminate'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Terminar admissão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissão terminada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "terminate", null);
__decorate([
    (0, common_1.Patch)(':id/reactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Reativar admissão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissão reativada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover admissão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admissão removida com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admissão não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "remove", null);
exports.AdmissionsController = AdmissionsController = __decorate([
    (0, swagger_1.ApiTags)('admissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admissions'),
    __metadata("design:paramtypes", [admissions_service_1.AdmissionsService])
], AdmissionsController);
//# sourceMappingURL=admissions.controller.js.map