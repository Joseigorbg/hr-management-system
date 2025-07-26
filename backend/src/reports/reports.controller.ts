import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, Request, UseInterceptors, UploadedFiles, BadRequestException, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar um novo relatório' })
  @ApiResponse({ status: 201, description: 'Relatório criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createReportDto: CreateReportDto, @Request() req: any) {
    try {
      console.log('Criando relatório com dados:', createReportDto, 'User ID:', req.user.id);
      return await this.reportsService.create(createReportDto, req.user.id);
    } catch (error) {
      console.error('Erro no controller create:', error);
      throw new BadRequestException(error.message || 'Erro ao criar relatório');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug/files')
  async listUploadedFiles() {
    try {
      const files = await this.reportsService.listUploadedFiles();
      return { files };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw new BadRequestException('Erro ao listar arquivos');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obter todos os relatórios com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página (padrão: 10)' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filtrar por tipo de relatório' })
  @ApiQuery({ name: 'generatedBy', required: false, type: String, description: 'Filtrar por ID do usuário que gerou o relatório' })
  @ApiResponse({ status: 200, description: 'Relatórios obtidos com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('type') type?: string,
    @Query('generatedBy') generatedBy?: string,
  ) {
    try {
      console.log('Buscando relatórios com parâmetros:', { page, limit, type, generatedBy });
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      if (isNaN(pageNum) || isNaN(limitNum)) {
        throw new BadRequestException('Página e limite devem ser números válidos');
      }
      return await this.reportsService.findAll(pageNum, limitNum, type, generatedBy);
    } catch (error) {
      console.error('Erro no controller findAll:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter um relatório por ID' })
  @ApiParam({ name: 'id', description: 'ID do relatório' })
  @ApiResponse({ status: 200, description: 'Relatório obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async findOne(@Param('id') id: string) {
    try {
      console.log('Buscando relatório com ID:', id);
      const report = await this.reportsService.findOne(id);
      console.log('Relatório encontrado:', report);
      return report;
    } catch (error) {
      console.error('Erro no controller findOne:', error);
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Put(':id') // Adicionado suporte para PUT
  @ApiOperation({ summary: 'Atualizar um relatório' })
  @ApiParam({ name: 'id', description: 'ID do relatório' })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({ status: 200, description: 'Relatório atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto, @Request() req: any) {
    try {
      console.log('Iniciando atualização do relatório:', { id, updateReportDto, method: req.method });
      const report = await this.reportsService.update(id, updateReportDto);
      console.log('Relatório atualizado com sucesso:', report);
      return report;
    } catch (error) {
      console.error('Erro no controller update:', {
        message: error.message,
        stack: error.stack,
        details: error,
      });
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
      }
      throw new BadRequestException(error.message || 'Erro ao atualizar relatório');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um relatório' })
  @ApiParam({ name: 'id', description: 'ID do relatório' })
  @ApiResponse({ status: 200, description: 'Relatório excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async remove(@Param('id') id: string) {
    try {
      console.log('Excluindo relatório com ID:', id);
      const result = await this.reportsService.remove(id);
      console.log('Relatório excluído:', result);
      return result;
    } catch (error) {
      console.error('Erro no controller remove:', error);
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './Uploads/reports',
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'image/jpeg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Tipo de arquivo não permitido. Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG ou PNG.'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Fazer upload de múltiplos documentos para um relatório' })
  @ApiBody({
    description: 'FormData com múltiplos arquivos e metadados',
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        reportId: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Documentos enviados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados ou arquivos inválidos' })
  async uploadDocument(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req: any,
  ) {
    try {
      console.log('Recebido no endpoint /reports/upload:', {
        files: files ? files.map(file => ({
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
        })) : 'Nenhum arquivo recebido',
        body: uploadDocumentDto,
        userId: req.user.id,
      });

      if (!files || files.length === 0) {
        throw new BadRequestException('Nenhum arquivo válido encontrado no FormData');
      }

      const uploadResults = await this.reportsService.uploadDocument({
        ...uploadDocumentDto,
        files,
        userId: req.user.id,
      });

      console.log('Upload concluído com sucesso:', uploadResults);
      return uploadResults;
    } catch (error) {
      console.error('Erro no controller upload:', {
        message: error.message,
        stack: error.stack,
        status: error.response?.status,
        details: error,
      });
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('download/:id')
  @ApiOperation({ summary: 'Baixar um documento por ID' })
  @ApiParam({ name: 'id', description: 'ID do documento' })
  @ApiResponse({ status: 200, description: 'Documento baixado com sucesso' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    try {
      const document = await this.reportsService.downloadDocument(id);
      console.log('Enviando documento:', {
        fileName: document.fileName,
        fileType: document.fileType,
        bufferSize: document.buffer.length,
      });

      res.set({
        'Content-Type': document.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Content-Length': document.buffer.length.toString(),
      });

      res.send(document.buffer);
    } catch (error) {
      console.error('Erro no controller downloadDocument:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('types')
  @ApiOperation({ summary: 'Obter tipos de relatórios disponíveis' })
  @ApiResponse({ status: 200, description: 'Tipos de relatórios obtidos com sucesso' })
  async getReportTypes() {
    return this.reportsService.getReportTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate/:type')
  @ApiOperation({ summary: 'Gerar um relatório por tipo e retornar PDF' })
  @ApiParam({ name: 'type', enum: ['employees', 'performance', 'tasks', 'admissions'], description: 'Tipo de relatório' })
  @ApiBody({
    description: 'Filtros para geração do relatório',
    required: true,
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        departmentId: { type: 'string' },
        positionId: { type: 'string' },
        isActive: { type: 'boolean' },
        period: { type: 'string' },
        evaluatorId: { type: 'string' },
        status: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Relatório PDF gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Tipo de relatório ou filtros inválidos' })
  async generateReport(@Param('type') type: string, @Body() filters: any, @Request() req: any, @Res() res: Response) {
    try {
      const validTypes = ['employees', 'performance', 'tasks', 'admissions'];
      if (!validTypes.includes(type)) {
        throw new BadRequestException('Tipo de relatório inválido');
      }
      filters.userId = req.user.id;
      const report = await this.reportsService[`generate${type.charAt(0).toUpperCase() + type.slice(1)}Report`](filters, req.user.id);

      // Wait for the PDF to be generated and uploaded
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Give time for doc.on('end') to complete

      const documents = await this.reportsService.findDocumentsByReportId(report.id);
      if (!documents || documents.length === 0) {
        throw new NotFoundException('Nenhum documento gerado para o relatório');
      }

      const document = await this.reportsService.downloadDocument(documents[0].id);
      res.set({
        'Content-Type': document.fileType || 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.name}.pdf"`,
        'Content-Length': document.buffer.length.toString(),
      });
      res.send(document.buffer);
    } catch (error) {
      console.error('Erro no controller generateReport:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/documents')
  @ApiOperation({ summary: 'Obter todos os documentos de um relatório específico' })
  @ApiParam({ name: 'id', description: 'ID do relatório' })
  @ApiResponse({ status: 200, description: 'Documentos obtidos com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório ou documentos não encontrados' })
  async getDocumentsByReportId(@Param('id') id: string) {
    try {
      const documents = await this.reportsService.findDocumentsByReportId(id);
      return documents;
    } catch (error) {
      console.error('Erro no controller getDocumentsByReportId:', error);
      throw error;
    }
  }
}