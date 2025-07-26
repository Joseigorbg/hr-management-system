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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const path_1 = require("path");
const promises_1 = require("fs/promises");
let AdmissionsService = class AdmissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAdmissionDto, files) {
        console.log('DTO recebido para criação:', createAdmissionDto);
        const { userId, hireDate, salary, contractType, positionId, departmentId, status, benefits, phone, address, terminationDate, terminationReason } = createAdmissionDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (positionId) {
            const position = await this.prisma.position.findUnique({ where: { id: positionId } });
            if (!position) {
                throw new common_1.NotFoundException('Cargo não encontrado');
            }
        }
        if (departmentId) {
            const department = await this.prisma.department.findUnique({ where: { id: departmentId } });
            if (!department) {
                throw new common_1.NotFoundException('Departamento não encontrado');
            }
        }
        let parsedBenefits = '{}';
        if (benefits) {
            try {
                parsedBenefits = typeof benefits === 'string' ? benefits : JSON.stringify(benefits);
                JSON.parse(parsedBenefits);
            }
            catch {
                throw new common_1.BadRequestException('Formato de benefits inválido. Deve ser um JSON válido.');
            }
        }
        if (status === 'terminated' && (!terminationDate || !terminationReason)) {
            throw new common_1.BadRequestException('Data e motivo do desligamento são obrigatórios para status "terminated"');
        }
        const admission = await this.prisma.admission.create({
            data: {
                user_id: userId,
                hireDate: new Date(hireDate),
                salary,
                contractType: contractType || 'CLT',
                position_id: positionId || null,
                department_id: departmentId || null,
                status: status || 'active',
                benefits: parsedBenefits,
                terminationDate: terminationDate ? new Date(terminationDate) : null,
                terminationReason: terminationReason || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        profile: true,
                    },
                },
                position: true,
                department: true,
                documents: true,
            },
        });
        if (phone || address) {
            await this.prisma.profile.upsert({
                where: { user_id: userId },
                update: {
                    phone: phone || user.profile?.phone || '',
                    address: address || user.profile?.address || '',
                },
                create: {
                    user_id: userId,
                    phone: phone || '',
                    address: address || '',
                    avatar: '/Uploads/profile/default-avatar.png',
                },
            });
        }
        if (files && files.length > 0) {
            const uploadDir = (0, path_1.join)(__dirname, '..', '..', 'Uploads', 'documents');
            await (0, promises_1.mkdir)(uploadDir, { recursive: true });
            for (const file of files) {
                await this.prisma.admissionDocument.create({
                    data: {
                        admissionId: admission.id,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath: file.path,
                        uploadedBy: userId,
                    },
                });
            }
        }
        return admission;
    }
    async update(id, updateAdmissionDto, files) {
        console.log('DTO recebido para atualização:', updateAdmissionDto);
        console.log('Arquivos recebidos:', files?.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })));
        const admission = await this.findOne(id);
        if (updateAdmissionDto.positionId) {
            const position = await this.prisma.position.findUnique({ where: { id: updateAdmissionDto.positionId } });
            if (!position) {
                throw new common_1.NotFoundException('Cargo não encontrado');
            }
        }
        if (updateAdmissionDto.departmentId) {
            const department = await this.prisma.department.findUnique({ where: { id: updateAdmissionDto.departmentId } });
            if (!department) {
                throw new common_1.NotFoundException('Departamento não encontrado');
            }
        }
        let parsedBenefits = admission.benefits;
        if (updateAdmissionDto.benefits) {
            try {
                parsedBenefits = typeof updateAdmissionDto.benefits === 'string' ? updateAdmissionDto.benefits : JSON.stringify(updateAdmissionDto.benefits);
                JSON.parse(parsedBenefits);
            }
            catch {
                throw new common_1.BadRequestException('Formato de benefits inválido. Deve ser um JSON válido.');
            }
        }
        if (updateAdmissionDto.status === 'terminated' && (!updateAdmissionDto.terminationDate || !updateAdmissionDto.terminationReason)) {
            throw new common_1.BadRequestException('Data e motivo do desligamento são obrigatórios para status "terminated"');
        }
        const updateData = {
            user_id: updateAdmissionDto.userId || admission.user_id,
            hireDate: updateAdmissionDto.hireDate ? new Date(updateAdmissionDto.hireDate) : admission.hireDate,
            salary: updateAdmissionDto.salary !== undefined ? updateAdmissionDto.salary : admission.salary,
            contractType: updateAdmissionDto.contractType || admission.contractType,
            position_id: updateAdmissionDto.positionId || admission.position?.id || null,
            department_id: updateAdmissionDto.departmentId || admission.department?.id || null,
            status: updateAdmissionDto.status || admission.status,
            benefits: parsedBenefits,
            terminationDate: updateAdmissionDto.terminationDate ? new Date(updateAdmissionDto.terminationDate) : admission.terminationDate || null,
            terminationReason: updateAdmissionDto.terminationReason || admission.terminationReason || null,
        };
        const updatedAdmission = await this.prisma.admission.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        profile: true,
                    },
                },
                position: true,
                department: true,
                documents: true,
            },
        });
        if (updateAdmissionDto.phone || updateAdmissionDto.address) {
            await this.prisma.profile.upsert({
                where: { user_id: updateAdmissionDto.userId || admission.user_id },
                update: {
                    phone: updateAdmissionDto.phone || admission.user.profile?.phone || '',
                    address: updateAdmissionDto.address || admission.user.profile?.address || '',
                },
                create: {
                    user_id: updateAdmissionDto.userId || admission.user_id,
                    phone: updateAdmissionDto.phone || '',
                    address: updateAdmissionDto.address || '',
                    avatar: '/Uploads/profile/default-avatar.png',
                },
            });
        }
        if (files && files.length > 0) {
            const uploadDir = (0, path_1.join)(__dirname, '..', '..', 'Uploads', 'documents');
            await (0, promises_1.mkdir)(uploadDir, { recursive: true });
            for (const file of files) {
                await this.prisma.admissionDocument.create({
                    data: {
                        admissionId: updatedAdmission.id,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath: file.path,
                        uploadedBy: updateAdmissionDto.userId || admission.user_id,
                    },
                });
            }
        }
        return updatedAdmission;
    }
    async uploadDocument(admissionId, file, uploadedBy) {
        console.log('Upload de documento:', { admissionId, file: { originalname: file.originalname, mimetype: file.mimetype, size: file.size }, uploadedBy });
        const admission = await this.prisma.admission.findUnique({
            where: { id: admissionId },
        });
        if (!admission) {
            throw new common_1.NotFoundException('Admissão não encontrada');
        }
        return this.prisma.admissionDocument.create({
            data: {
                admissionId,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                filePath: file.path,
                uploadedBy,
            },
        });
    }
    async uploadDocuments(admissionId, files, uploadedBy) {
        console.log('Upload de múltiplos documentos:', {
            admissionId,
            files: files.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })),
            uploadedBy
        });
        const admission = await this.prisma.admission.findUnique({
            where: { id: admissionId },
        });
        if (!admission) {
            throw new common_1.NotFoundException('Admissão não encontrada');
        }
        const uploadDir = (0, path_1.join)(__dirname, '..', '..', 'Uploads', 'documents');
        await (0, promises_1.mkdir)(uploadDir, { recursive: true });
        const documents = [];
        for (const file of files) {
            const document = await this.prisma.admissionDocument.create({
                data: {
                    admissionId,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: file.path,
                    uploadedBy,
                },
            });
            documents.push(document);
        }
        return documents;
    }
    async deleteDocument(documentId) {
        const document = await this.prisma.admissionDocument.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento não encontrado');
        }
        try {
            await (0, promises_1.unlink)(document.filePath);
        }
        catch (error) {
            console.warn('Erro ao excluir arquivo do disco:', error.message);
        }
        return this.prisma.admissionDocument.delete({
            where: { id: documentId },
        });
    }
    async findAll(page = 1, limit = 10, status, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status && status !== 'all')
            where.status = status;
        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { position: { name: { contains: search, mode: 'insensitive' } } },
                { department: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [admissions, total] = await Promise.all([
            this.prisma.admission.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            email: true,
                            profile: true,
                        },
                    },
                    position: true,
                    department: true,
                    documents: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.admission.count({ where }),
        ]);
        return {
            data: admissions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const admission = await this.prisma.admission.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        role: true,
                        profile: true,
                    },
                },
                position: true,
                department: true,
                documents: true,
            },
        });
        if (!admission) {
            throw new common_1.NotFoundException('Admissão não encontrada');
        }
        return admission;
    }
    async findByUser(userId) {
        const admissions = await this.prisma.admission.findMany({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        role: true,
                        profile: true,
                    },
                },
                position: true,
                department: true,
                documents: true,
            },
        });
        if (!admissions || admissions.length === 0) {
            throw new common_1.NotFoundException('Nenhuma admissão encontrada para este usuário');
        }
        return admissions;
    }
    async remove(id) {
        const admission = await this.findOne(id);
        const documents = await this.prisma.admissionDocument.findMany({
            where: { admissionId: id },
        });
        for (const doc of documents) {
            try {
                await (0, promises_1.unlink)(doc.filePath);
            }
            catch (error) {
                console.warn('Erro ao excluir arquivo do disco:', error.message);
            }
        }
        await this.prisma.admissionDocument.deleteMany({
            where: { admissionId: id },
        });
        return this.prisma.admission.delete({
            where: { id },
        });
    }
    async terminate(id, terminationDate, terminationReason) {
        await this.findOne(id);
        if (terminationDate && !terminationReason || !terminationDate && terminationReason) {
            throw new common_1.BadRequestException('Data e motivo do desligamento devem ser fornecidos juntos');
        }
        return this.prisma.admission.update({
            where: { id },
            data: {
                status: 'terminated',
                terminationDate: terminationDate ? new Date(terminationDate) : null,
                terminationReason: terminationReason || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        profile: true,
                    },
                },
                position: true,
                department: true,
                documents: true,
            },
        });
    }
    async reactivate(id) {
        await this.findOne(id);
        return this.prisma.admission.update({
            where: { id },
            data: {
                status: 'active',
                terminationDate: null,
                terminationReason: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        profile: true,
                    },
                },
                position: true,
                department: true,
                documents: true,
            },
        });
    }
    async getAdmissionsByDateRange(startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [admissions, total] = await Promise.all([
            this.prisma.admission.findMany({
                where: {
                    hireDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            email: true,
                            profile: true,
                        },
                    },
                    position: true,
                    department: true,
                    documents: true,
                },
                orderBy: { hireDate: 'desc' },
            }),
            this.prisma.admission.count({
                where: {
                    hireDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            }),
        ]);
        return {
            data: admissions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdmissionsService = AdmissionsService;
exports.AdmissionsService = AdmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdmissionsService);
//# sourceMappingURL=admissions.service.js.map