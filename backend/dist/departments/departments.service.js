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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let DepartmentsService = class DepartmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async withRetry(operation, maxAttempts = 3, initialDelayMs = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                if (attempt === maxAttempts || !error.message.includes("Can't reach database server")) {
                    throw new common_1.HttpException(error.message || 'Erro ao acessar o banco de dados', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
                console.warn(`Retrying operation (attempt ${attempt}/${maxAttempts}) due to database connection issue...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        throw new common_1.HttpException('Número máximo de tentativas atingido', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async create(createDepartmentDto) {
        try {
            const existingDepartment = await this.prisma.department.findUnique({
                where: { name: createDepartmentDto.name },
            });
            if (existingDepartment) {
                throw new common_1.ConflictException('Departamento com este nome já existe');
            }
            if (createDepartmentDto.managerId) {
                const manager = await this.prisma.user.findUnique({
                    where: { id: createDepartmentDto.managerId },
                });
                if (!manager) {
                    throw new common_1.NotFoundException('Gerente não encontrado');
                }
            }
            const department = await this.prisma.department.create({
                data: {
                    name: createDepartmentDto.name,
                    description: createDepartmentDto.description,
                    managerId: createDepartmentDto.managerId,
                },
            });
            return { data: department };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao criar departamento', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(page = 1, limit = 10, search, include) {
        try {
            const skip = (page - 1) * limit;
            const where = search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {};
            const includeOptions = include
                ? { users: { select: { id: true, name: true, surname: true, email: true } } }
                : {};
            const [departments, total] = await this.withRetry(() => Promise.all([
                this.prisma.department.findMany({
                    where,
                    skip,
                    take: limit,
                    include: includeOptions,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.department.count({ where }),
            ]));
            return {
                data: departments,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao carregar departamentos', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const department = await this.prisma.department.findUnique({
                where: { id },
                include: { users: { select: { id: true, name: true, surname: true, email: true } } },
            });
            if (!department) {
                throw new common_1.NotFoundException('Departamento não encontrado');
            }
            return { data: department };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao carregar departamento', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateDepartmentDto) {
        try {
            const department = await this.prisma.department.findUnique({ where: { id } });
            if (!department) {
                throw new common_1.NotFoundException('Departamento não encontrado');
            }
            if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
                const existingDepartment = await this.prisma.department.findUnique({
                    where: { name: updateDepartmentDto.name },
                });
                if (existingDepartment) {
                    throw new common_1.ConflictException('Departamento com este nome já existe');
                }
            }
            if (updateDepartmentDto.managerId) {
                const manager = await this.prisma.user.findUnique({
                    where: { id: updateDepartmentDto.managerId },
                });
                if (!manager) {
                    throw new common_1.NotFoundException('Gerente não encontrado');
                }
            }
            const updatedDepartment = await this.prisma.department.update({
                where: { id },
                data: {
                    name: updateDepartmentDto.name,
                    description: updateDepartmentDto.description,
                    managerId: updateDepartmentDto.managerId,
                },
            });
            return { data: updatedDepartment };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao atualizar departamento', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const department = await this.prisma.department.findUnique({ where: { id } });
            if (!department) {
                throw new common_1.NotFoundException('Departamento não encontrado');
            }
            const userCount = await this.prisma.user.count({
                where: { departmentId: id },
            });
            if (userCount > 0) {
                throw new common_1.ConflictException('Não é possível excluir departamento com usuários associados');
            }
            await this.prisma.department.delete({ where: { id } });
            return { message: 'Departamento excluído com sucesso' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao excluir departamento', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map