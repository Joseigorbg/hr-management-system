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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { mkdirSync } from 'fs';

@ApiTags('admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(__dirname, '..', '..', 'Uploads', 'documents');
        mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Criar nova admissão' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Admissão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário, cargo ou departamento não encontrado' })
  async create(@Body() createAdmissionDto: CreateAdmissionDto, @UploadedFiles() files?: Express.Multer.File[]) {
    try {
      console.log('DTO recebido no controller para criação:', createAdmissionDto);
      console.log('Arquivos recebidos:', files?.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })));
      return await this.admissionsService.create(createAdmissionDto, files);
    } catch (error) {
      console.error('Erro ao criar admissão:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Erro ao criar admissão',
        details: error.message || 'Erro desconhecido',
      });
    }
  }

  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(__dirname, '..', '..', 'Uploads', 'documents');
        mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Enviar documento para admissão' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Documento enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 404, description: 'Admissão não encontrada' })
  async uploadDocument(
    @Param('id') admissionId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthUser() user: any,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('Nenhum arquivo enviado');
      }
      console.log('Upload de documentos:', { admissionId, files: files.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })), uploadedBy: user.id });
      return await this.admissionsService.uploadDocuments(admissionId, files, user.id);
    } catch (error) {
      console.error('Erro ao enviar documentos:', error);
      throw error;
    }
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Remover documento de admissão' })
  @ApiResponse({ status: 200, description: 'Documento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Documento ou admissão não encontrada' })
  async deleteDocument(@Param('id') admissionId: string, @Param('documentId') documentId: string) {
    try {
      return await this.admissionsService.deleteDocument(documentId);
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar admissões' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrar por status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Termo de busca' })
  @ApiResponse({ status: 200, description: 'Lista de admissões retornada com sucesso' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      return await this.admissionsService.findAll(
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        status,
        search,
      );
    } catch (error) {
      console.error('Erro ao listar admissões:', error);
      throw new BadRequestException({
        message: 'Erro ao listar admissões',
        details: error.message || 'Erro desconhecido',
      });
    }
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Buscar admissões por período' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'Data final (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiResponse({ status: 200, description: 'Admissões do período retornadas com sucesso' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      return await this.admissionsService.getAdmissionsByDateRange(
        startDate,
        endDate,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
      );
    } catch (error) {
      console.error('Erro ao buscar admissões por período:', error);
      throw new BadRequestException({
        message: 'Erro ao buscar admissões por período',
        details: error.message || 'Erro desconhecido',
      });
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar admissão por usuário' })
  @ApiResponse({ status: 200, description: 'Admissão do usuário retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Admissão não encontrada' })
  async findByUser(@Param('userId') userId: string) {
    try {
      return await this.admissionsService.findByUser(userId);
    } catch (error) {
      console.error('Erro ao buscar admissão por usuário:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar admissão por ID' })
  @ApiResponse({ status: 200, description: 'Admissão retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Admissão não encontrada' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.admissionsService.findOne(id);
    } catch (error) {
      console.error('Erro ao buscar admissão:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(__dirname, '..', '..', 'Uploads', 'documents');
        mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Atualizar admissão' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Admissão atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Admissão, cargo ou departamento não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateAdmissionDto: UpdateAdmissionDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @AuthUser() user?: any,
  ) {
    try {
      console.log('Dados recebidos no controller para atualização:', {
        id,
        updateAdmissionDto,
        files: files?.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })),
        userId: user?.id,
      });
      return await this.admissionsService.update(id, updateAdmissionDto, files);
    } catch (error) {
      console.error('Erro ao atualizar admissão:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Erro ao atualizar admissão',
        details: error.message || 'Erro desconhecido',
      });
    }
  }

  @Patch(':id/terminate')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Terminar admissão' })
  @ApiResponse({ status: 200, description: 'Admissão terminada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Admissão não encontrada' })
  async terminate(
    @Param('id') id: string,
    @Body() body: { terminationDate?: string; terminationReason?: string }
  ) {
    try {
      return await this.admissionsService.terminate(id, body.terminationDate, body.terminationReason);
    } catch (error) {
      console.error('Erro ao terminar admissão:', error);
      throw error;
    }
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reativar admissão' })
  @ApiResponse({ status: 200, description: 'Admissão reativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Admissão não encontrada' })
  async reactivate(@Param('id') id: string) {
    try {
      return await this.admissionsService.reactivate(id);
    } catch (error) {
      console.error('Erro ao reativar admissão:', error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover admissão' })
  @ApiResponse({ status: 200, description: 'Admissão removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Admissão não encontrada' })
  async remove(@Param('id') id: string) {
    try {
      return await this.admissionsService.remove(id);
    } catch (error) {
      console.error('Erro ao remover admissão:', error);
      throw error;
    }
  }
}