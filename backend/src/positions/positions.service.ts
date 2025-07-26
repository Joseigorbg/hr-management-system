import { HttpException, HttpStatus, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async withRetry<T>(operation: () => Promise<T>, maxAttempts = 3, initialDelayMs = 1000): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts || !error.message.includes("Can't reach database server")) {
          throw new HttpException(
            error.message || 'Erro ao acessar o banco de dados',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Retrying operation (attempt ${attempt}/${maxAttempts}) due to database connection issue...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new HttpException('Número máximo de tentativas atingido', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async create(createPositionDto: CreatePositionDto) {
    try {
      const existingPosition = await this.prisma.position.findFirst({
        where: { name: { equals: createPositionDto.name, mode: 'insensitive' as Prisma.QueryMode } },
      });
      if (existingPosition) {
        throw new ConflictException('Cargo com este nome já existe');
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
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao criar cargo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;
      const where: Prisma.PositionWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          }
        : {};

      const [positions, total] = await this.withRetry(() =>
        Promise.all([
          this.prisma.position.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.position.count({ where }),
        ]),
      );

      return {
        data: positions,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao carregar cargos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const position = await this.prisma.position.findUnique({
        where: { id },
      });
      if (!position) {
        throw new NotFoundException('Cargo não encontrado');
      }
      return { data: position };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao carregar cargo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    try {
      const position = await this.prisma.position.findUnique({ where: { id } });
      if (!position) {
        throw new NotFoundException('Cargo não encontrado');
      }

      if (updatePositionDto.name && updatePositionDto.name !== position.name) {
        const existingPosition = await this.prisma.position.findFirst({
          where: { name: { equals: updatePositionDto.name, mode: 'insensitive' as Prisma.QueryMode } },
        });
        if (existingPosition) {
          throw new ConflictException('Cargo com este nome já existe');
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
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao atualizar cargo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const position = await this.prisma.position.findUnique({ where: { id } });
      if (!position) {
        throw new NotFoundException('Cargo não encontrado');
      }

      const userCount = await this.prisma.user.count({
        where: { positionId: id },
      });
      if (userCount > 0) {
        throw new ConflictException('Não é possível excluir cargo com usuários associados');
      }

      await this.prisma.position.delete({ where: { id } });
      return { message: 'Cargo excluído com sucesso' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao excluir cargo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}