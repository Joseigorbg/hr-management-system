import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSupporterDto } from './dto/create-supporter.dto';
import { UpdateSupporterDto } from './dto/update-supporter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupporterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [supporters, total] = await Promise.all([
      this.prisma.supporter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supporter.count({ where }),
    ]);

    return {
      data: supporters,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: string) {
    const supporter = await this.prisma.supporter.findUnique({ where: { id } });
    if (!supporter) {
      throw new NotFoundException(`Apoiador com ID ${id} não encontrado`);
    }
    return supporter;
  }

  async create(createSupporterDto: CreateSupporterDto) {
    if (!createSupporterDto.name || !createSupporterDto.phone || !createSupporterDto.address) {
      throw new BadRequestException('Nome, telefone e endereço são obrigatórios');
    }

    const data: Prisma.SupporterUncheckedCreateInput = {
      name: createSupporterDto.name,
      phone: createSupporterDto.phone,
      address: createSupporterDto.address,
      cep: createSupporterDto.cep,
      mapping: createSupporterDto.mapping,
      supportType: createSupporterDto.supportType,
      status: createSupporterDto.status || 'active',
      lat: createSupporterDto.lat,
      lng: createSupporterDto.lng,
      updatedAt: new Date(), // Explicitly set updatedAt
    };

    return this.prisma.supporter.create({
      data,
    });
  }

  async update(id: string, updateSupporterDto: UpdateSupporterDto) {
    const supporter = await this.prisma.supporter.findUnique({ where: { id } });
    if (!supporter) {
      throw new NotFoundException(`Apoiador com ID ${id} não encontrado`);
    }

    if (updateSupporterDto.name === '' || updateSupporterDto.phone === '' || updateSupporterDto.address === '') {
      throw new BadRequestException('Nome, telefone e endereço não podem ser vazios');
    }

    const data: Prisma.SupporterUncheckedUpdateInput = {
      name: updateSupporterDto.name ?? supporter.name,
      phone: updateSupporterDto.phone ?? supporter.phone,
      address: updateSupporterDto.address ?? supporter.address,
      cep: updateSupporterDto.cep ?? supporter.cep,
      mapping: updateSupporterDto.mapping ?? supporter.mapping,
      supportType: updateSupporterDto.supportType ?? supporter.supportType,
      status: updateSupporterDto.status ?? supporter.status,
      lat: updateSupporterDto.lat ?? supporter.lat,
      lng: updateSupporterDto.lng ?? supporter.lng,
      updatedAt: new Date(), // Explicitly set updatedAt for updates
    };

    return this.prisma.supporter.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const supporter = await this.prisma.supporter.findUnique({ where: { id } });
    if (!supporter) {
      throw new NotFoundException(`Apoiador com ID ${id} não encontrado`);
    }
    await this.prisma.supporter.delete({ where: { id } });
    return { success: true };
  }
}