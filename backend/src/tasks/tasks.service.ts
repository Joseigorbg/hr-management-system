import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-tasks.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

async findAll(page: number, limit: number, filters: { userId?: string; startDate?: string; endDate?: string; isActive?: boolean; currentUserId?: string }) {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.startDate) where.startDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) where.endDate = { lte: new Date(filters.endDate) };
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  // Apenas aplica o filtro de currentUserId para usuários não admin
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

  async create(dto: CreateTaskDto) {
    if (dto.userId && dto.groupId) {
      throw new Error('A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.');
    }
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
    }
    if (dto.groupId) {
      const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException('Grupo não encontrado');
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

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
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

  async delete(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.delete({ where: { id } });
  }

  async assignTask(dto: AssignTaskDto, requesterRole: string) {
    if (!['admin', 'manager'].includes(requesterRole)) {
      throw new ForbiddenException('Only admins or managers can assign tasks');
    }
    const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (dto.userId && dto.groupId) {
      throw new Error('A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.');
    }
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
    }
    if (dto.groupId) {
      const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException('Grupo não encontrado');
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

  async unassignTask(type: 'user' | 'group', id: string, taskId: string, requesterRole: string) {
    if (!['admin', 'manager'].includes(requesterRole)) {
      throw new ForbiddenException('Only admins or managers can unassign tasks');
    }
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (type === 'user' && task.userId !== id) {
      throw new NotFoundException('Tarefa não atribuída a este usuário');
    }
    if (type === 'group' && task.groupId !== id) {
      throw new NotFoundException('Tarefa não atribuída a este grupo');
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
}