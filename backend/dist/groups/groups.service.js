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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let GroupsService = class GroupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async withRetry(operation, maxAttempts = 3, initialDelayMs = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                console.warn(`Tentativa ${attempt}/${maxAttempts} falhou: ${error.message}`);
                if (attempt === maxAttempts || !error.message.includes("Can't reach database server")) {
                    throw error;
                }
                const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        throw new common_1.InternalServerErrorException('Máximo de tentativas de retry alcançado');
    }
    async findAll() {
        return this.withRetry(async () => {
            const groups = await this.prisma.group.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            return { data: groups };
        });
    }
    async create(name, description) {
        if (!name?.trim()) {
            throw new common_1.BadRequestException(['O nome do grupo é obrigatório']);
        }
        if (name.trim().length < 3) {
            throw new common_1.BadRequestException(['O nome do grupo deve ter pelo menos 3 caracteres']);
        }
        if (name.trim().length > 100) {
            throw new common_1.BadRequestException(['O nome do grupo não pode exceder 100 caracteres']);
        }
        try {
            return await this.withRetry(() => this.prisma.group.create({
                data: {
                    name: name.trim(),
                    description: description?.trim() || null,
                },
            }));
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException(['O nome do grupo já está em uso']);
            }
            throw error;
        }
    }
    async addUserToGroup(groupId, userId) {
        const isValidUUID = (str) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
        };
        if (!isValidUUID(groupId)) {
            throw new common_1.BadRequestException(['groupId deve ser um UUID válido']);
        }
        if (!isValidUUID(userId)) {
            throw new common_1.BadRequestException(['userId deve ser um UUID válido']);
        }
        return this.withRetry(async () => {
            const group = await this.prisma.group.findUnique({
                where: { id: groupId },
            });
            if (!group) {
                throw new common_1.NotFoundException(`Grupo com ID ${groupId} não encontrado`);
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`Usuário com ID ${userId} não encontrado`);
            }
            const existingAssociation = await this.prisma.group.findFirst({
                where: {
                    id: groupId,
                    users: {
                        some: {
                            id: userId,
                        },
                    },
                },
            });
            if (existingAssociation) {
                throw new common_1.ConflictException(['Usuário já está associado a este grupo']);
            }
            return this.prisma.group.update({
                where: { id: groupId },
                data: {
                    users: {
                        connect: { id: userId },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map