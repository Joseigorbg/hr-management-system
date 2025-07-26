import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Positions')
@Controller('positions') // Ajustado para remover /api, já coberto por /api/v1 em main.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cargos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de cargos' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.positionsService.findAll(pageNum, limitNum, search);
  }

  @Get('test')
  @ApiOperation({ summary: 'Teste de conexão' })
  @ApiResponse({ status: 200, description: 'Conexão bem-sucedida' })
  test() {
    return { message: 'Servidor NestJS está funcionando!' };
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Criar novo cargo' })
  @ApiResponse({ status: 201, description: 'Cargo criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Cargo com este nome já existe' })
  async create(@Body() createPositionDto: CreatePositionDto) {
    const position = await this.positionsService.create(createPositionDto);
    return { data: position, status: 201 };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cargo por ID' })
  @ApiResponse({ status: 200, description: 'Dados do cargo' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  async findOne(@Param('id') id: string) {
    const position = await this.positionsService.findOne(id);
    return { data: position };
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Atualizar cargo' })
  @ApiResponse({ status: 200, description: 'Cargo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  async update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    const position = await this.positionsService.update(id, updatePositionDto);
    return { data: position };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Excluir cargo' })
  @ApiResponse({ status: 200, description: 'Cargo excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  @ApiResponse({ status: 409, description: 'Cargo possui usuários associados' })
  async remove(@Param('id') id: string) {
    await this.positionsService.remove(id);
    return { message: 'Cargo excluído com sucesso', status: 200 };
  }
}