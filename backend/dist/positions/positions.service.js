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
exports.PositionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let PositionsService = class PositionsService {
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
    async create(createPositionDto) {
        try {
            const existingPosition = await this.prisma.position.findFirst({
                where: { name: { equals: createPositionDto.name, mode: 'insensitive' } },
            });
            if (existingPosition) {
                throw new common_1.ConflictException('Cargo com este nome já existe');
            }
            const position = await this.prisma.position.create({
                data: {
                    name: createPositionDto.name,
                    description: createPositionDto.description,
                    salary: createPositionDto.salary,
                    status: createPositionDto.status || 'Ativo',
                },
            });
            return { data: position };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao criar cargo', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(page = 1, limit = 10, search) {
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
            const [positions, total] = await this.withRetry(() => Promise.all([
                this.prisma.position.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.position.count({ where }),
            ]));
            return {
                data: positions,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao carregar cargos', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const position = await this.prisma.position.findUnique({
                where: { id },
            });
            if (!position) {
                throw new common_1.NotFoundException('Cargo não encontrado');
            }
            return { data: position };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao carregar cargo', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updatePositionDto) {
        try {
            const position = await this.prisma.position.findUnique({ where: { id } });
            if (!position) {
                throw new common_1.NotFoundException('Cargo não encontrado');
            }
            if (updatePositionDto.name && updatePositionDto.name !== position.name) {
                const existingPosition = await this.prisma.position.findFirst({
                    where: { name: { equals: updatePositionDto.name, mode: 'insensitive' } },
                });
                if (existingPosition) {
                    throw new common_1.ConflictException('Cargo com este nome já existe');
                }
            }
            const updatedPosition = await this.prisma.position.update({
                where: { id },
                data: {
                    name: updatePositionDto.name,
                    description: updatePositionDto.description,
                    salary: updatePositionDto.salary,
                    status: updatePositionDto.status,
                },
            });
            return { data: updatedPosition };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao atualizar cargo', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const position = await this.prisma.position.findUnique({ where: { id } });
            if (!position) {
                throw new common_1.NotFoundException('Cargo não encontrado');
            }
            const userCount = await this.prisma.user.count({
                where: { positionId: id },
            });
            if (userCount > 0) {
                throw new common_1.ConflictException('Não é possível excluir cargo com usuários associados');
            }
            await this.prisma.position.delete({ where: { id } });
            return { message: 'Cargo excluído com sucesso' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erro ao excluir cargo', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PositionsService = PositionsService;
exports.PositionsService = PositionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PositionsService);
//# sourceMappingURL=positions.service.js.map