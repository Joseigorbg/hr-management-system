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
  UseInterceptors,
  UploadedFiles,
  Res,
  UploadedFile,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto'; // Novo import
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin', 'manager')
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const fileName = `file-${uniqueSuffix}${ext}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @ApiConsumes('multipart/form-data')
  create(@Body() createUserDto: CreateUserDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.usersService.create(createUserDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [Object] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar usuários com filtros avançados' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'vacation', 'inactive', 'terminated'] })
  @ApiResponse({ status: 200, description: 'Lista de usuários filtrados', type: [Object] })
  findUsers(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('status') status?: 'active' | 'vacation' | 'inactive' | 'terminated',
  ) {
    return this.usersService.findUsers(name, email, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const fileName = `file-${uniqueSuffix}${ext}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @ApiConsumes('multipart/form-data')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return await this.usersService.update(id, updateUserDto, files);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/activate')
  @Roles('admin')
  @ApiOperation({ summary: 'Ativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário ativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Post(':id/documents')
  @Roles('admin', 'manager')
  @UseInterceptors(FilesInterceptor('file', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const fileName = `file-${uniqueSuffix}${ext}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Apenas arquivos PDF, JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Upload de documento para um usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Documento enviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário ou admissão não encontrada' })
  @ApiResponse({ status: 400, description: 'Nenhum arquivo enviado ou tipo de arquivo inválido' })
  async uploadDocument(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.usersService.uploadDocument(id, files[0]);
  }

  @Delete(':id/documents/:documentId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Excluir documento de um usuário' })
  @ApiResponse({ status: 200, description: 'Documento excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Documento ou usuário não encontrado' })
  async deleteDocument(@Param('id') userId: string, @Param('documentId') documentId: string) {
    return this.usersService.deleteDocument(userId, documentId);
  }

  @Get(':id/documents/:documentId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obter documento de um usuário' })
  @ApiResponse({ status: 200, description: 'Documento retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Documento ou usuário não encontrado' })
  async getDocument(@Param('id') userId: string, @Param('documentId') documentId: string, @Res() res: Response) {
    const document = await this.usersService.getDocument(userId, documentId);
    res.set({
      'Content-Type': document.fileType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`,
    });
    res.sendFile(document.filePath);
  }

  @Patch('profile/me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    const userId = req.user.id; // Assume que o JwtAuthGuard injeta o user no request
    return this.usersService.updateProfile(userId, updateData);
  }

  @Patch('profile/me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile'); // Corrigido para 'profile'
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const fileName = `avatar-${uniqueSuffix}${ext}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Apenas arquivos JPEG ou PNG são permitidos'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Adicionado limite de 5MB
  }))
  @ApiOperation({ summary: 'Atualizar avatar do usuário logado' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Nenhum arquivo enviado ou tipo inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.id;
    return this.usersService.updateAvatar(userId, file);
  }
}
