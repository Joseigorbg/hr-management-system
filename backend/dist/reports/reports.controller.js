"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const create_report_dto_1 = require("./dto/create-report.dto");
const update_report_dto_1 = require("./dto/update-report.dto");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const path = __importStar(require("path"));
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async create(createReportDto, req) {
        try {
            console.log('Criando relatório com dados:', createReportDto, 'User ID:', req.user.id);
            return await this.reportsService.create(createReportDto, req.user.id);
        }
        catch (error) {
            console.error('Erro no controller create:', error);
            throw new common_1.BadRequestException(error.message || 'Erro ao criar relatório');
        }
    }
    async listUploadedFiles() {
        try {
            const files = await this.reportsService.listUploadedFiles();
            return { files };
        }
        catch (error) {
            console.error('Erro ao listar arquivos:', error);
            throw new common_1.BadRequestException('Erro ao listar arquivos');
        }
    }
    async findAll(page = '1', limit = '10', type, generatedBy) {
        try {
            console.log('Buscando relatórios com parâmetros:', { page, limit, type, generatedBy });
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            if (isNaN(pageNum) || isNaN(limitNum)) {
                throw new common_1.BadRequestException('Página e limite devem ser números válidos');
            }
            return await this.reportsService.findAll(pageNum, limitNum, type, generatedBy);
        }
        catch (error) {
            console.error('Erro no controller findAll:', error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            console.log('Buscando relatório com ID:', id);
            const report = await this.reportsService.findOne(id);
            console.log('Relatório encontrado:', report);
            return report;
        }
        catch (error) {
            console.error('Erro no controller findOne:', error);
            throw new common_1.NotFoundException(`Relatório com ID ${id} não encontrado`);
        }
    }
    async update(id, updateReportDto, req) {
        try {
            console.log('Iniciando atualização do relatório:', { id, updateReportDto, method: req.method });
            const report = await this.reportsService.update(id, updateReportDto);
            console.log('Relatório atualizado com sucesso:', report);
            return report;
        }
        catch (error) {
            console.error('Erro no controller update:', {
                message: error.message,
                stack: error.stack,
                details: error,
            });
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(`Relatório com ID ${id} não encontrado`);
            }
            throw new common_1.BadRequestException(error.message || 'Erro ao atualizar relatório');
        }
    }
    async remove(id) {
        try {
            console.log('Excluindo relatório com ID:', id);
            const result = await this.reportsService.remove(id);
            console.log('Relatório excluído:', result);
            return result;
        }
        catch (error) {
            console.error('Erro no controller remove:', error);
            throw new common_1.NotFoundException(`Relatório com ID ${id} não encontrado`);
        }
    }
    async uploadDocument(files, uploadDocumentDto, req) {
        try {
            console.log('Recebido no endpoint /reports/upload:', {
                files: files ? files.map(file => ({
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                })) : 'Nenhum arquivo recebido',
                body: uploadDocumentDto,
                userId: req.user.id,
            });
            if (!files || files.length === 0) {
                throw new common_1.BadRequestException('Nenhum arquivo válido encontrado no FormData');
            }
            const uploadResults = await this.reportsService.uploadDocument({
                ...uploadDocumentDto,
                files,
                userId: req.user.id,
            });
            console.log('Upload concluído com sucesso:', uploadResults);
            return uploadResults;
        }
        catch (error) {
            console.error('Erro no controller upload:', {
                message: error.message,
                stack: error.stack,
                status: error.response?.status,
                details: error,
            });
            throw error;
        }
    }
    async downloadDocument(id, res) {
        try {
            const document = await this.reportsService.downloadDocument(id);
            console.log('Enviando documento:', {
                fileName: document.fileName,
                fileType: document.fileType,
                bufferSize: document.buffer.length,
            });
            res.set({
                'Content-Type': document.fileType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${document.fileName}"`,
                'Content-Length': document.buffer.length.toString(),
            });
            res.send(document.buffer);
        }
        catch (error) {
            console.error('Erro no controller downloadDocument:', error);
            throw error;
        }
    }
    async getReportTypes() {
        return this.reportsService.getReportTypes();
    }
    async generateReport(type, filters, req, res) {
        try {
            const validTypes = ['employees', 'performance', 'tasks', 'admissions'];
            if (!validTypes.includes(type)) {
                throw new common_1.BadRequestException('Tipo de relatório inválido');
            }
            filters.userId = req.user.id;
            const report = await this.reportsService[`generate${type.charAt(0).toUpperCase() + type.slice(1)}Report`](filters, req.user.id);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const documents = await this.reportsService.findDocumentsByReportId(report.id);
            if (!documents || documents.length === 0) {
                throw new common_1.NotFoundException('Nenhum documento gerado para o relatório');
            }
            const document = await this.reportsService.downloadDocument(documents[0].id);
            res.set({
                'Content-Type': document.fileType || 'application/pdf',
                'Content-Disposition': `attachment; filename="${report.name}.pdf"`,
                'Content-Length': document.buffer.length.toString(),
            });
            res.send(document.buffer);
        }
        catch (error) {
            console.error('Erro no controller generateReport:', error);
            throw error;
        }
    }
    async getDocumentsByReportId(id) {
        try {
            const documents = await this.reportsService.findDocumentsByReportId(id);
            return documents;
        }
        catch (error) {
            console.error('Erro no controller getDocumentsByReportId:', error);
            throw error;
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo relatório' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Relatório criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_dto_1.CreateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('debug/files'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "listUploadedFiles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter todos os relatórios com paginação' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Número da página (padrão: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Itens por página (padrão: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String, description: 'Filtrar por tipo de relatório' }),
    (0, swagger_1.ApiQuery)({ name: 'generatedBy', required: false, type: String, description: 'Filtrar por ID do usuário que gerou o relatório' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatórios obtidos com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro interno do servidor' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('generatedBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter um relatório por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do relatório' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatório obtido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relatório não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar um relatório' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do relatório' }),
    (0, swagger_1.ApiBody)({ type: update_report_dto_1.UpdateReportDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatório atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relatório não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_report_dto_1.UpdateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir um relatório' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do relatório' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatório excluído com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relatório não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: './Uploads/reports',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const extension = path.extname(file.originalname);
                cb(null, `${uniqueSuffix}${extension}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/plain',
                'image/jpeg',
                'image/png',
            ];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Tipo de arquivo não permitido. Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG ou PNG.'), false);
            }
            cb(null, true);
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Fazer upload de múltiplos documentos para um relatório' }),
    (0, swagger_1.ApiBody)({
        description: 'FormData com múltiplos arquivos e metadados',
        required: true,
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
                reportId: { type: 'string' },
                userId: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Documentos enviados com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados ou arquivos inválidos' }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_document_dto_1.UploadDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('download/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Baixar um documento por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do documento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documento baixado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Documento não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter tipos de relatórios disponíveis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tipos de relatórios obtidos com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportTypes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('generate/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar um relatório por tipo e retornar PDF' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: ['employees', 'performance', 'tasks', 'admissions'], description: 'Tipo de relatório' }),
    (0, swagger_1.ApiBody)({
        description: 'Filtros para geração do relatório',
        required: true,
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                departmentId: { type: 'string' },
                positionId: { type: 'string' },
                isActive: { type: 'boolean' },
                period: { type: 'string' },
                evaluatorId: { type: 'string' },
                status: { type: 'string' },
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatório PDF gerado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Tipo de relatório ou filtros inválidos' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter todos os documentos de um relatório específico' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do relatório' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documentos obtidos com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relatório ou documentos não encontrados' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDocumentsByReportId", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map