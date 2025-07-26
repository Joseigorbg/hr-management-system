import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SupporterService } from './supporter.service';
import { CreateSupporterDto } from './dto/create-supporter.dto';
import { UpdateSupporterDto } from './dto/update-supporter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';

@ApiTags('supporters')
@Controller('api/v1/supporter')
@UseGuards(JwtAuthGuard)
export class SupporterController {
  constructor(private readonly supporterService: SupporterService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os apoiadores' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiQuery({ name: 'search', required: false, example: 'João' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.supporterService.findAll(Number(page), Number(limit), search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter apoiador por ID' })
  async findOne(@Param('id') id: string) {
    const supporter = await this.supporterService.findOne(id);
    if (!supporter) {
      throw new NotFoundException('Apoiador não encontrado');
    }
    return supporter;
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo apoiador' })
  async create(@Body() createSupporterDto: CreateSupporterDto) {
    return this.supporterService.create(createSupporterDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar apoiador' })
  async update(@Param('id') id: string, @Body() updateSupporterDto: UpdateSupporterDto) {
    return this.supporterService.update(id, updateSupporterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir apoiador' })
  async delete(@Param('id') id: string) {
    return this.supporterService.delete(id);
  }
}