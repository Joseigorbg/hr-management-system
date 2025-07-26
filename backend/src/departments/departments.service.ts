import { HttpException, HttpStatus, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
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

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const existingDepartment = await this.prisma.department.findUnique({
        where: { name: createDepartmentDto.name },
      });
      if (existingDepartment) {
        throw new ConflictException('Departamento com este nome já existe');
      }

      if (createDepartmentDto.managerId) {
        const manager = await this.prisma.user.findUnique({
          where: { id: createDepartmentDto.managerId },
        });
        if (!manager) {
          throw new NotFoundException('Gerente não encontrado');
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
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao criar departamento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, include?: string) {
    try {
      const skip = (page - 1) * limit;
      const where: Prisma.DepartmentWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          }
        : {};

      const includeOptions: Prisma.DepartmentInclude = include
        ? { users: { select: { id: true, name: true, surname: true, email: true } } }
        : {};

      const [departments, total] = await this.withRetry(() =>
        Promise.all([
          this.prisma.department.findMany({
            where,
            skip,
            take: limit,
            include: includeOptions,
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.department.count({ where }),
        ]),
      );

      return {
        data: departments,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao carregar departamentos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
        include: { users: { select: { id: true, name: true, surname: true, email: true } } },
      });
      if (!department) {
        throw new NotFoundException('Departamento não encontrado');
      }
      return { data: department };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao carregar departamento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      const department = await this.prisma.department.findUnique({ where: { id } });
      if (!department) {
        throw new NotFoundException('Departamento não encontrado');
      }

      if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
        const existingDepartment = await this.prisma.department.findUnique({
          where: { name: updateDepartmentDto.name },
        });
        if (existingDepartment) {
          throw new ConflictException('Departamento com este nome já existe');
        }
      }

      if (updateDepartmentDto.managerId) {
        const manager = await this.prisma.user.findUnique({
          where: { id: updateDepartmentDto.managerId },
        });
        if (!manager) {
          throw new NotFoundException('Gerente não encontrado');
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
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao atualizar departamento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const department = await this.prisma.department.findUnique({ where: { id } });
      if (!department) {
        throw new NotFoundException('Departamento não encontrado');
      }

      const userCount = await this.prisma.user.count({
        where: { departmentId: id },
      });
      if (userCount > 0) {
        throw new ConflictException('Não é possível excluir departamento com usuários associados');
      }

      await this.prisma.department.delete({ where: { id } });
      return { message: 'Departamento excluído com sucesso' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao excluir departamento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}