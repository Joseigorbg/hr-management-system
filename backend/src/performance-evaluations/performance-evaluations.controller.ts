import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PerformanceEvaluationsService } from './performance-evaluations.service';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ValidationError } from 'class-validator';

@ApiTags('performance-evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance-evaluations')
export class PerformanceEvaluationsController {
  constructor(private readonly performanceEvaluationsService: PerformanceEvaluationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova avaliação de desempenho' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário ou avaliador não encontrado' })
  async create(@Body() createPerformanceEvaluationDto: CreatePerformanceEvaluationDto) {
    try {
      console.log('Recebido DTO para criação no controlador:', JSON.stringify(createPerformanceEvaluationDto, null, 2));
      return await this.performanceEvaluationsService.create(createPerformanceEvaluationDto);
    } catch (error) {
      console.error('Erro no controlador ao criar avaliação:', {
        message: error.message,
        stack: error.stack,
        dto: JSON.stringify(createPerformanceEvaluationDto, null, 2),
        name: error.name,
        response: error.response ? JSON.stringify(error.response, null, 2) : 'Sem response',
      });

      if (Array.isArray(error) && error.every((e) => e instanceof ValidationError)) {
        throw new BadRequestException({
          message: 'Dados inválidos fornecidos',
          errors: error.map((e: ValidationError) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
      }

      throw new BadRequestException(
        error.message || 'Erro ao criar avaliação. Verifique os dados fornecidos.',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar avaliações de desempenho' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filtrar por usuário' })
  @ApiQuery({ name: 'evaluatorId', required: false, type: String, description: 'Filtrar por avaliador' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Filtrar por período' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('evaluatorId') evaluatorId?: string,
    @Query('period') period?: string,
  ) {
    return this.performanceEvaluationsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      userId,
      evaluatorId,
      period,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar avaliações por usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiResponse({ status: 200, description: 'Avaliações do usuário retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.performanceEvaluationsService.getEvaluationsByUser(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('evaluator/:evaluatorId')
  @ApiOperation({ summary: 'Buscar avaliações por avaliador' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiResponse({ status: 200, description: 'Avaliações do avaliador retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliador não encontrado' })
  findByEvaluator(
    @Param('evaluatorId') evaluatorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.performanceEvaluationsService.getEvaluationsByEvaluator(
      evaluatorId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('period/:period')
  @ApiOperation({ summary: 'Buscar avaliações por período' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiResponse({ status: 200, description: 'Avaliações do período retornadas com sucesso' })
  findByPeriod(
    @Param('period') period: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.performanceEvaluationsService.getEvaluationsByPeriod(
      period,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiResponse({ status: 200, description: 'Avaliação retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.performanceEvaluationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar avaliação de desempenho' })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updatePerformanceEvaluationDto: UpdatePerformanceEvaluationDto,
  ) {
    try {
      console.log('Recebido DTO para atualização no controlador:', JSON.stringify(updatePerformanceEvaluationDto, null, 2));
      return await this.performanceEvaluationsService.update(id, updatePerformanceEvaluationDto);
    } catch (error) {
      console.error('Erro no controlador ao atualizar avaliação:', {
        message: error.message,
        stack: error.stack,
        dto: JSON.stringify(updatePerformanceEvaluationDto, null, 2),
        name: error.name,
      });

      if (Array.isArray(error) && error.every((e) => e instanceof ValidationError)) {
        throw new BadRequestException({
          message: 'Dados inválidos fornecidos',
          errors: error.map((e: ValidationError) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
      }

      throw new BadRequestException(
        error.message || 'Erro ao atualizar avaliação. Verifique os dados fornecidos.',
      );
    }
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprovar avaliação de desempenho' })
  @ApiResponse({ status: 200, description: 'Avaliação aprovada com sucesso' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão para aprovar' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async approve(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.performanceEvaluationsService.approveEvaluation(id, req.user.id);
    } catch (error) {
      console.error('Erro no controlador ao aprovar avaliação:', {
        message: error.message,
        stack: error.stack,
        id,
        approverId: req.user.id,
      });
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover avaliação de desempenho' })
  @ApiResponse({ status: 200, description: 'Avaliação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async remove(@Param('id') id: string) {
    try {
      return await this.performanceEvaluationsService.remove(id);
    } catch (error) {
      console.error('Erro no controlador ao remover avaliação:', {
        message: error.message,
        stack: error.stack,
        id,
      });
      throw error;
    }
  }
}