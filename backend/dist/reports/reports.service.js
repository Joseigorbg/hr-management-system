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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const pdfkit_1 = __importDefault(require("pdfkit"));
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.uploadDir = path.join(__dirname, '../../Uploads/reports');
        this.ensureUploadDirectory();
    }
    async ensureUploadDirectory() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            console.log('Diretório de upload criado ou já existe:', this.uploadDir);
            await fs.access(this.uploadDir, fs.constants.W_OK);
            console.log('Diretório de upload tem permissões de escrita');
        }
        catch (err) {
            console.error('Erro ao criar ou acessar diretório de upload:', err);
            throw new common_1.BadRequestException('Erro ao criar ou acessar diretório de upload');
        }
    }
    async listUploadedFiles() {
        try {
            const files = await fs.readdir(this.uploadDir);
            console.log('Arquivos no diretório uploads/reports:', files);
            return files;
        }
        catch (error) {
            console.error('Erro ao listar arquivos:', error);
            throw new common_1.BadRequestException('Erro ao listar arquivos');
        }
    }
    async create(createReportDto, generated_by) {
        const { name, type, frequency, scheduledDate } = createReportDto;
        return this.prisma.reports.create({
            data: {
                id: (0, uuid_1.v4)(),
                name,
                type,
                generated_by,
                frequency,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                documents: true,
            },
        });
    }
    async findAll(page = 1, limit = 10, type, generated_by) {
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (generated_by)
            where.generated_by = generated_by;
        try {
            const [reports, total] = await Promise.all([
                this.prisma.reports.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        users: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        documents: true,
                    },
                    orderBy: { created_at: 'desc' },
                }),
                this.prisma.reports.count({ where }),
            ]);
            return {
                data: reports,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            console.error('Erro ao buscar relatórios:', {
                message: error.message,
                code: error.code,
                meta: error.meta,
                stack: error.stack,
            });
            if (error.code === 'P1001') {
                throw new common_1.BadRequestException('Não foi possível conectar ao banco de dados. Verifique a conexão com o servidor.');
            }
            throw new common_1.BadRequestException('Erro ao listar relatórios. Tente novamente mais tarde.');
        }
    }
    async findOne(id) {
        const report = await this.prisma.reports.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                documents: true,
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('Relatório não encontrado');
        }
        return report;
    }
    async update(id, updateReportDto) {
        await this.findOne(id);
        const { name, type, frequency, scheduledDate } = updateReportDto;
        return this.prisma.reports.update({
            where: { id },
            data: {
                name,
                type,
                frequency,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                documents: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.reports.delete({
            where: { id },
        });
    }
    async uploadDocument(uploadDocumentDto) {
        const { reportId, userId, files } = uploadDocumentDto;
        console.log('Iniciando uploadDocument no serviço:', {
            reportId,
            userId,
            fileCount: files.length,
            fileDetails: files.map(file => ({
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
            })),
        });
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Nenhum arquivo válido enviado');
        }
        if (!reportId) {
            throw new common_1.BadRequestException('Campo obrigatório faltando: reportId');
        }
        const report = await this.prisma.reports.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException(`Relatório com ID ${reportId} não encontrado`);
        }
        const uploadResults = await Promise.all(files.map(async (file) => {
            const fileId = (0, uuid_1.v4)();
            const filePath = file.path;
            console.log('Usando arquivo salvo em:', filePath);
            try {
                await fs.access(filePath);
                console.log('Arquivo verificado com sucesso:', filePath);
                const document = await this.prisma.reportDocument.create({
                    data: {
                        id: fileId,
                        reportId,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath,
                        uploaded_at: new Date(),
                        uploaded_by: userId,
                    },
                });
                console.log('Documento registrado no banco:', document);
                return document;
            }
            catch (error) {
                console.error('Erro ao processar upload do arquivo:', {
                    fileName: file.originalname,
                    message: error.message,
                    stack: error.stack,
                    filePath,
                });
                if (filePath && (await fs.access(filePath).then(() => true).catch(() => false))) {
                    await fs.unlink(filePath).catch((cleanupError) => {
                        console.error('Erro ao limpar arquivo local:', cleanupError);
                    });
                }
                throw new common_1.BadRequestException(`Erro ao salvar o documento ${file.originalname}: ${error.message || 'Erro desconhecido'}`);
            }
        }));
        return uploadResults;
    }
    async downloadDocument(id) {
        console.log('Iniciando downloadDocument com ID:', id);
        const document = await this.prisma.reportDocument.findUnique({
            where: { id },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                filePath: true,
                uploaded_at: true,
            },
        });
        if (!document) {
            console.error('Documento não encontrado no banco de dados para ID:', id);
            throw new common_1.NotFoundException(`Documento com ID ${id} não encontrado`);
        }
        console.log('Documento encontrado:', {
            id: document.id,
            fileName: document.fileName,
            fileType: document.fileType,
            filePath: document.filePath,
            uploadedAt: document.uploaded_at,
        });
        try {
            await fs.access(document.filePath);
            const fileBuffer = await fs.readFile(document.filePath);
            console.log('Arquivo lido com sucesso:', {
                filePath: document.filePath,
                bufferSize: fileBuffer.length,
            });
            return {
                fileName: `${document.id}_${document.fileName}`,
                fileType: document.fileType,
                buffer: fileBuffer,
            };
        }
        catch (error) {
            console.error('Erro ao acessar ou ler o arquivo:', {
                filePath: document.filePath,
                error: error.message,
                stack: error.stack,
            });
            throw new common_1.NotFoundException(`Arquivo não encontrado no sistema de arquivos: ${document.filePath}`);
        }
    }
    async findDocumentsByReportId(reportId) {
        const documents = await this.prisma.reportDocument.findMany({
            where: { reportId },
            select: {
                id: true,
                reportId: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                uploaded_at: true,
                uploaded_by: true,
            },
        });
        if (!documents || documents.length === 0) {
            throw new common_1.NotFoundException('Nenhum documento encontrado para este relatório');
        }
        return documents;
    }
    async generateEmployeesReport(filters, generated_by) {
        const where = {};
        if (filters?.departmentId)
            where.departmentId = filters.departmentId;
        if (filters?.positionId)
            where.positionId = filters.positionId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        const employees = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                position: { select: { name: true, salary: true } },
                department: { select: { name: true } },
                admissions: { select: { hireDate: true, contractType: true, salary: true, status: true } },
            },
            orderBy: { name: 'asc' },
        });
        const summary = {
            total: employees.length,
            active: employees.filter(e => e.isActive).length,
            inactive: employees.filter(e => !e.isActive).length,
            byDepartment: {},
            byPosition: {},
            byRole: {},
        };
        employees.forEach(emp => {
            const dept = emp.department?.name || 'Sem departamento';
            summary.byDepartment[dept] = (summary.byDepartment[dept] || 0) + 1;
            const pos = emp.position?.name || 'Sem cargo';
            summary.byPosition[pos] = (summary.byPosition[pos] || 0) + 1;
            summary.byRole[emp.role] = (summary.byRole[emp.role] || 0) + 1;
        });
        const report = await this.create({
            name: `Relatório de Funcionários - ${new Date().toISOString()}`,
            type: 'employees',
            frequency: 'Manual',
            scheduledDate: new Date().toISOString(),
        }, generated_by);
        const doc = new pdfkit_1.default();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const uploadDto = {
                reportId: report.id,
                userId: generated_by,
                files: [{
                        buffer: pdfBuffer,
                        size: pdfBuffer.length,
                        originalname: `employees_report_${new Date().toISOString().split('T')[0]}.pdf`,
                        mimetype: 'application/pdf',
                    }],
            };
            await this.uploadDocument(uploadDto);
        });
        doc.text(`Relatório de Funcionários\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n`);
        doc.text(`Total: ${summary.total}\nAtivos: ${summary.active}\nInativos: ${summary.inactive}\n`);
        employees.forEach(emp => {
            doc.text(`Nome: ${emp.name}, Departamento: ${emp.department?.name || 'N/A'}, Cargo: ${emp.position?.name || 'N/A'}\n`);
        });
        doc.end();
        return report;
    }
    async generatePerformanceReport(filters, generated_by) {
        const where = {};
        if (filters?.period)
            where.period = filters.period;
        if (filters?.userId)
            where.user_id = filters.userId;
        if (filters?.evaluatorId)
            where.evaluator_id = filters.evaluatorId;
        if (filters?.status)
            where.status = filters.status;
        const evaluations = await this.prisma.performanceEvaluation.findMany({
            where,
            include: {
                users_performance_evaluations_user_idTousers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: { select: { name: true } },
                        department: { select: { name: true } },
                    },
                },
                users_performance_evaluations_evaluator_idTousers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const summary = {
            total: evaluations.length,
            averageScore: evaluations.length > 0 ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length : 0,
            byStatus: {},
            byPeriod: {},
            scoreDistribution: {
                excellent: evaluations.filter(e => e.score >= 9).length,
                good: evaluations.filter(e => e.score >= 7 && e.score < 9).length,
                average: evaluations.filter(e => e.score >= 5 && e.score < 7).length,
                poor: evaluations.filter(e => e.score < 5).length,
            },
        };
        evaluations.forEach(evaluation => {
            summary.byStatus[evaluation.status] = (summary.byStatus[evaluation.status] || 0) + 1;
            summary.byPeriod[evaluation.period] = (summary.byPeriod[evaluation.period] || 0) + 1;
        });
        const report = await this.create({
            name: `Relatório de Desempenho - ${new Date().toISOString()}`,
            type: 'performance',
            frequency: 'Manual',
            scheduledDate: new Date().toISOString(),
        }, generated_by);
        const doc = new pdfkit_1.default();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const uploadDto = {
                reportId: report.id,
                userId: generated_by,
                files: [{
                        buffer: pdfBuffer,
                        size: pdfBuffer.length,
                        originalname: `performance_report_${new Date().toISOString().split('T')[0]}.pdf`,
                        mimetype: 'application/pdf',
                    }],
            };
            await this.uploadDocument(uploadDto);
        });
        doc.text(`Relatório de Desempenho\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n`);
        doc.text(`Total: ${summary.total}, Média: ${summary.averageScore.toFixed(2)}\n`);
        evaluations.forEach(evaluation => {
            doc.text(`Usuário: ${evaluation.users_performance_evaluations_user_idTousers.name}, Avaliador: ${evaluation.users_performance_evaluations_evaluator_idTousers.name}, Score: ${evaluation.score}\n`);
        });
        doc.end();
        return report;
    }
    async generateTasksReport(filters, generated_by) {
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        if (filters?.startDate && filters?.endDate) {
            where.startDate = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
        }
        const tasks = await this.prisma.task.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: { select: { name: true } },
                        department: { select: { name: true } },
                    },
                },
            },
            orderBy: { startDate: 'asc' },
        });
        const summary = {
            totalTasks: tasks.length,
            activeTasks: tasks.filter(t => t.isActive).length,
            byUser: {},
            byStatus: {},
        };
        tasks.forEach(task => {
            const userName = task.user ? task.user.name : 'Não atribuído';
            summary.byUser[userName] = (summary.byUser[userName] || 0) + 1;
            summary.byStatus[task.isActive ? 'Ativa' : 'Inativa'] = (summary.byStatus[task.isActive ? 'Ativa' : 'Inativa'] || 0) + 1;
        });
        const report = await this.create({
            name: `Relatório de Tarefas - ${new Date().toISOString()}`,
            type: 'tasks',
            frequency: 'Manual',
            scheduledDate: new Date().toISOString(),
        }, generated_by);
        const doc = new pdfkit_1.default();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const uploadDto = {
                reportId: report.id,
                userId: generated_by,
                files: [{
                        buffer: pdfBuffer,
                        size: pdfBuffer.length,
                        originalname: `tasks_report_${new Date().toISOString().split('T')[0]}.pdf`,
                        mimetype: 'application/pdf',
                    }],
            };
            await this.uploadDocument(uploadDto);
        });
        doc.text(`Relatório de Tarefas\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n`);
        doc.text(`Total: ${summary.totalTasks}, Ativas: ${summary.activeTasks}\n`);
        tasks.forEach(task => {
            doc.text(`Título: ${task.title}, Usuário: ${task.user?.name || 'N/A'}, Data: ${task.startDate.toLocaleDateString('pt-BR')}\n`);
        });
        doc.end();
        return report;
    }
    async generateAdmissionsReport(filters, generated_by) {
        const where = {};
        if (filters?.status)
            where.admissions = { status: filters.status };
        if (filters?.contractType)
            where.admissions = { contractType: filters.contractType };
        if (filters?.startDate && filters?.endDate) {
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new common_1.BadRequestException('Datas inválidas');
            }
            where.admissions = { hireDate: { gte: startDate, lte: endDate } };
        }
        const admissions = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                position: { select: { name: true } },
                department: { select: { name: true } },
                admissions: {
                    select: {
                        hireDate: true,
                        contractType: true,
                        salary: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const summary = {
            total: admissions.length,
            averageSalary: admissions.length > 0 ? admissions.reduce((sum, adm) => sum + (adm.admissions[0]?.salary || 0), 0) / admissions.length : 0,
            byStatus: {},
            byContractType: {},
            byMonth: {},
        };
        admissions.forEach(adm => {
            const admission = adm.admissions[0];
            if (admission) {
                summary.byStatus[admission.status] = (summary.byStatus[admission.status] || 0) + 1;
                summary.byContractType[admission.contractType] = (summary.byContractType[admission.contractType] || 0) + 1;
                const month = admission.hireDate.toISOString().substring(0, 7);
                summary.byMonth[month] = (summary.byMonth[month] || 0) + 1;
            }
        });
        const report = await this.create({
            name: `Relatório de Admissões - ${new Date().toISOString()}`,
            type: 'admissions',
            frequency: 'Manual',
            scheduledDate: new Date().toISOString(),
        }, generated_by);
        const doc = new pdfkit_1.default();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const uploadDto = {
                reportId: report.id,
                userId: generated_by,
                files: [{
                        buffer: pdfBuffer,
                        size: pdfBuffer.length,
                        originalname: `admissions_report_${new Date().toISOString().split('T')[0]}.pdf`,
                        mimetype: 'application/pdf',
                    }],
            };
            await this.uploadDocument(uploadDto);
        });
        doc.text(`Relatório de Admissões\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n`);
        doc.text(`Total: ${summary.total}, Média Salarial: ${summary.averageSalary.toFixed(2)}\n`);
        admissions.forEach(adm => {
            const admission = adm.admissions[0];
            doc.text(`Nome: ${adm.name}, Data: ${admission?.hireDate.toLocaleDateString('pt-BR') || 'N/A'}, Tipo: ${admission?.contractType || 'N/A'}\n`);
        });
        doc.end();
        return report;
    }
    async getReportTypes() {
        return ['employees', 'performance', 'tasks', 'admissions'];
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map