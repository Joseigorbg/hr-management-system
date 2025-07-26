import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private async withRetry<T>(operation: () => Promise<T>, maxAttempts = 3, initialDelayMs = 1000): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Tentativa ${attempt}/${maxAttempts} falhou: ${error.message}`);
        if (attempt === maxAttempts || !error.message.includes("Can't reach database server")) {
          throw error;
        }
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new InternalServerErrorException('Máximo de tentativas de retry alcançado');
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

  async create(name: string, description?: string) {
    if (!name?.trim()) {
      throw new BadRequestException(['O nome do grupo é obrigatório']);
    }
    if (name.trim().length < 3) {
      throw new BadRequestException(['O nome do grupo deve ter pelo menos 3 caracteres']);
    }
    if (name.trim().length > 100) {
      throw new BadRequestException(['O nome do grupo não pode exceder 100 caracteres']);
    }
    try {
      return await this.withRetry(() =>
        this.prisma.group.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
          },
        }),
      );
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(['O nome do grupo já está em uso']);
      }
      throw error;
    }
  }

  async addUserToGroup(groupId: string, userId: string) {
    const isValidUUID = (str: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    if (!isValidUUID(groupId)) {
      throw new BadRequestException(['groupId deve ser um UUID válido']);
    }
    if (!isValidUUID(userId)) {
      throw new BadRequestException(['userId deve ser um UUID válido']);
    }

    return this.withRetry(async () => {
      const group = await this.prisma.group.findUnique({
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
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
        throw new ConflictException(['Usuário já está associado a este grupo']);
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
}