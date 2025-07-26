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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async withRetry(operation, maxAttempts = 3, initialDelayMs = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                if (attempt === maxAttempts || !error.message.includes('Can\'t reach database server')) {
                    throw error;
                }
                const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
                console.warn(`Retrying operation (attempt ${attempt}/${maxAttempts}) due to database connection issue...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        throw new Error('Max retry attempts reached');
    }
    async create(createUserDto, files) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já está em uso');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password || `temp_${Date.now()}`, 10);
        const salaryValue = createUserDto.salary !== undefined
            ? typeof createUserDto.salary === 'string'
                ? parseFloat(createUserDto.salary)
                : createUserDto.salary
            : 0.0;
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                name: createUserDto.name,
                surname: createUserDto.surname,
                password_hash: hashedPassword,
                role: createUserDto.role || 'employee',
                positionId: createUserDto.positionId,
                departmentId: createUserDto.departmentId,
                profile: {
                    create: {
                        address: '',
                        phone: '',
                        avatar: '/uploads/profile/default-avatar.png',
                    },
                },
                admissions: {
                    create: {
                        hireDate: createUserDto.hireDate ? new Date(createUserDto.hireDate) : new Date(),
                        contractType: createUserDto.contractType || 'CLT',
                        salary: salaryValue,
                        status: createUserDto.status || 'active',
                        benefits: createUserDto.benefits || '{}',
                    },
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                role: true,
                positionId: true,
                departmentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
                admissions: {
                    select: {
                        id: true,
                        hireDate: true,
                        contractType: true,
                        salary: true,
                        status: true,
                        benefits: true,
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
            },
        });
        if (files && files.length > 0) {
            const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
            await fs.mkdir(uploadDir, { recursive: true });
            for (const file of files) {
                const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`).replace(/\\/g, '/');
                await fs.writeFile(filePath, file.buffer);
                await this.prisma.admissionDocument.create({
                    data: {
                        admissionId: user.admissions.id,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath: filePath.replace(new RegExp(`^${path.resolve(uploadDir)}`, 'i'), '/uploads/documents'),
                        uploadedAt: new Date(),
                    },
                });
            }
        }
        return user;
    }
    async findAll(page = 1, limit = 10, search, status) {
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status && status !== 'all') {
            if (status === 'active') {
                where.OR = [
                    { admissions: { status: { equals: 'active' } } },
                    { admissions: { is: null } },
                ];
            }
            else {
                where.admissions = { status: { equals: status } };
            }
        }
        else {
            where.OR = [
                { admissions: { status: { equals: 'active' } } },
                { admissions: { is: null } },
            ];
        }
        const [users, total] = await this.withRetry(() => Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    profile: true,
                    admissions: {
                        select: {
                            id: true,
                            hireDate: true,
                            contractType: true,
                            salary: true,
                            status: true,
                            benefits: true,
                            documents: {
                                select: {
                                    id: true,
                                    fileName: true,
                                    fileType: true,
                                    fileSize: true,
                                    filePath: true,
                                    uploadedAt: true,
                                },
                            },
                        },
                    },
                    department: true,
                    position: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]));
        return {
            data: users,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findUsers(name, email, status) {
        const where = { isActive: true };
        if (name)
            where.name = { contains: name, mode: 'insensitive' };
        if (email)
            where.email = { contains: email, mode: 'insensitive' };
        if (status)
            where.admissions = { status: { equals: status } };
        return this.prisma.user.findMany({
            where,
            include: {
                profile: true,
                admissions: {
                    select: { id: true, status: true },
                },
                department: true,
                position: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const user = await this.withRetry(() => this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                admissions: {
                    select: {
                        id: true,
                        hireDate: true,
                        contractType: true,
                        salary: true,
                        status: true,
                        benefits: true,
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
                department: true,
                position: true,
            },
        }));
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
                admissions: {
                    include: {
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
                department: true,
                position: true,
            },
        });
    }
    async findByEmailWithPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            password_hash: user.password_hash,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async update(id, updateUserDto, files) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({ where: { email: updateUserDto.email } });
            if (existingUser) {
                throw new common_1.ConflictException('Email já está em uso');
            }
        }
        const updateData = {
            name: updateUserDto.name,
            surname: updateUserDto.surname,
            email: updateUserDto.email,
            role: updateUserDto.role,
            positionId: updateUserDto.positionId,
            departmentId: updateUserDto.departmentId,
        };
        if (updateUserDto.password) {
            updateData.password_hash = await bcrypt.hash(updateUserDto.password, 10);
        }
        if (updateUserDto.hireDate ||
            updateUserDto.salary !== undefined ||
            updateUserDto.contractType ||
            updateUserDto.status ||
            updateUserDto.benefits) {
            let benefits = updateUserDto.benefits;
            if (benefits && typeof benefits !== 'string') {
                benefits = JSON.stringify(benefits);
            }
            else if (!benefits) {
                benefits = '{}';
            }
            const salaryValue = updateUserDto.salary !== undefined
                ? typeof updateUserDto.salary === 'string'
                    ? parseFloat(updateUserDto.salary)
                    : updateUserDto.salary
                : user.admissions?.salary || 0.0;
            updateData.admissions = {
                upsert: {
                    where: { user_id: id },
                    create: {
                        hireDate: updateUserDto.hireDate ? new Date(updateUserDto.hireDate) : new Date(),
                        contractType: updateUserDto.contractType || 'CLT',
                        salary: salaryValue,
                        status: updateUserDto.status || 'active',
                        benefits: benefits,
                    },
                    update: {
                        hireDate: updateUserDto.hireDate ? new Date(updateUserDto.hireDate) : user.admissions.hireDate,
                        salary: salaryValue,
                        contractType: updateUserDto.contractType || user.admissions.contractType,
                        status: updateUserDto.status || user.admissions.status,
                        benefits: benefits,
                    },
                },
            };
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                profile: true,
                admissions: {
                    select: {
                        id: true,
                        hireDate: true,
                        contractType: true,
                        salary: true,
                        status: true,
                        benefits: true,
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
                department: true,
                position: true,
            },
        });
        if (files && files.length > 0) {
            const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
            await fs.mkdir(uploadDir, { recursive: true });
            for (const file of files) {
                const filePath = path.join(uploadDir, path.basename(file.path));
                await this.prisma.admissionDocument.create({
                    data: {
                        admissionId: updatedUser.admissions.id,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath: `/uploads/documents/${path.basename(file.path)}`,
                        uploadedAt: new Date(),
                        uploadedBy: updatedUser.id,
                    },
                });
            }
        }
        return updatedUser;
    }
    async remove(id) {
        const user = await this.findOne(id);
        const admissionExists = await this.prisma.admission.findUnique({
            where: { user_id: id },
        });
        const updateData = {
            isActive: false,
            updatedAt: new Date(),
        };
        if (admissionExists) {
            updateData.admissions = {
                update: {
                    where: { user_id: id },
                    data: { status: 'terminated' },
                },
            };
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                profile: true,
                admissions: {
                    include: {
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
                department: true,
                position: true,
            },
        });
    }
    async activate(id) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: true },
            include: {
                profile: true,
                admissions: {
                    include: {
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
                department: true,
                position: true,
            },
        });
    }
    async uploadDocument(userId, file) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { admissions: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${userId} não encontrado`);
        }
        if (!user.admissions) {
            throw new common_1.NotFoundException(`Admissão não encontrada para o usuário com ID ${userId}`);
        }
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo foi enviado');
        }
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`).replace(/\\/g, '/');
        await fs.writeFile(filePath, file.buffer);
        const document = await this.prisma.admissionDocument.create({
            data: {
                admissionId: user.admissions.id,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                filePath: filePath.replace(new RegExp(`^${path.resolve(uploadDir)}`, 'i'), '/uploads/documents'),
                uploadedAt: new Date(),
            },
        });
        return {
            id: document.id,
            fileName: document.fileName,
            fileType: document.fileType,
            fileSize: document.fileSize,
            filePath: document.filePath,
            uploadedAt: document.uploadedAt,
        };
    }
    async deleteDocument(userId, documentId) {
        const document = await this.prisma.admissionDocument.findUnique({
            where: { id: documentId },
            include: { admission: { include: { user: true } } },
        });
        if (!document || document.admission.user_id !== userId) {
            throw new common_1.NotFoundException('Documento ou usuário não encontrado');
        }
        try {
            await fs.unlink(path.join(__dirname, '..', '..', document.filePath));
        }
        catch (error) {
            console.warn(`Não foi possível remover o arquivo ${document.filePath}: ${error.message}`);
        }
        await this.prisma.admissionDocument.delete({
            where: { id: documentId },
        });
        return { message: 'Documento excluído com sucesso' };
    }
    async getDocument(userId, documentId) {
        const document = await this.prisma.admissionDocument.findUnique({
            where: { id: documentId },
            include: { admission: { include: { user: true } } },
        });
        if (!document || document.admission.user_id !== userId) {
            throw new common_1.NotFoundException('Documento ou usuário não encontrado');
        }
        return {
            fileName: document.fileName,
            fileType: document.fileType,
            filePath: path.join(__dirname, '..', '..', document.filePath),
        };
    }
    async updateProfile(userId, updateData) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${userId} não encontrado`);
        }
        const profileData = {
            phone: updateData.phone,
            address: updateData.address,
        };
        return await this.prisma.user.update({
            where: { id: userId },
            data: {
                profile: {
                    update: {
                        where: { user_id: userId },
                        data: profileData,
                    },
                },
            },
            include: {
                profile: true,
                admissions: {
                    select: {
                        id: true,
                        hireDate: true,
                        contractType: true,
                        salary: true,
                        status: true,
                        benefits: true,
                        documents: {
                            select: {
                                id: true,
                                fileName: true,
                                fileType: true,
                                fileSize: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                },
                department: true,
                position: true,
            },
        });
    }
    async updateAvatar(userId, file) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${userId} não encontrado`);
        }
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo fornecido');
        }
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile');
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName).replace(/\\/g, '/');
        await fs.writeFile(filePath, file.buffer);
        const avatarUrl = `/uploads/profile/${fileName}`;
        return await this.prisma.profile.update({
            where: { user_id: userId },
            data: { avatar: avatarUrl },
            include: { user: true },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map