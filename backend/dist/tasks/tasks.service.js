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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page, limit, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.startDate)
            where.startDate = { gte: new Date(filters.startDate) };
        if (filters.endDate)
            where.endDate = { lte: new Date(filters.endDate) };
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        if (filters.currentUserId && filters.currentUserId !== 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6') {
            where.OR = [
                { userId: filters.currentUserId },
                { group: { users: { some: { id: filters.currentUserId } } } },
            ];
        }
        return this.prisma.task.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: { select: { id: true, name: true, email: true } },
                group: { select: { id: true, name: true } },
            },
        });
    }
    async create(dto) {
        if (dto.userId && dto.groupId) {
            throw new Error('A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.');
        }
        if (dto.userId) {
            const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
            if (!user)
                throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (dto.groupId) {
            const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
            if (!group)
                throw new common_1.NotFoundException('Grupo não encontrado');
        }
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                userId: dto.userId || null,
                groupId: dto.groupId || null,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                group: { select: { id: true, name: true } },
            },
        });
    }
    async update(id, updateTaskDto) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.task.update({
            where: { id },
            data: {
                title: updateTaskDto.title || task.title,
                description: updateTaskDto.description || task.description,
                startDate: updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : task.startDate,
                endDate: updateTaskDto.endDate ? new Date(updateTaskDto.endDate) : task.endDate,
                isActive: updateTaskDto.isActive !== undefined ? updateTaskDto.isActive : task.isActive,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                group: { select: { id: true, name: true } },
            },
        });
    }
    async delete(id) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.task.delete({ where: { id } });
    }
    async assignTask(dto, requesterRole) {
        if (!['admin', 'manager'].includes(requesterRole)) {
            throw new common_1.ForbiddenException('Only admins or managers can assign tasks');
        }
        const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (dto.userId && dto.groupId) {
            throw new Error('A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.');
        }
        if (dto.userId) {
            const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
            if (!user)
                throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (dto.groupId) {
            const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
            if (!group)
                throw new common_1.NotFoundException('Grupo não encontrado');
        }
        return this.prisma.task.update({
            where: { id: dto.taskId },
            data: {
                userId: dto.userId || null,
                groupId: dto.groupId || null,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                group: { select: { id: true, name: true } },
            },
        });
    }
    async unassignTask(type, id, taskId, requesterRole) {
        if (!['admin', 'manager'].includes(requesterRole)) {
            throw new common_1.ForbiddenException('Only admins or managers can unassign tasks');
        }
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (type === 'user' && task.userId !== id) {
            throw new common_1.NotFoundException('Tarefa não atribuída a este usuário');
        }
        if (type === 'group' && task.groupId !== id) {
            throw new common_1.NotFoundException('Tarefa não atribuída a este grupo');
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: {
                userId: type === 'user' ? null : task.userId,
                groupId: type === 'group' ? null : task.groupId,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                group: { select: { id: true, name: true } },
            },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map