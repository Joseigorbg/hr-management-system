import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Buscar meu perfil' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  getMyProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar meu perfil' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Atualizar meu avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './Uploads/profile';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpeg|png|gif)/)) {
          return cb(new BadRequestException('Apenas imagens JPEG, PNG ou GIF são permitidas'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async updateMyAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log('Requisição PATCH /profile/me/avatar recebida');
    if (!file) {
      console.log('Nenhum arquivo recebido no controller');
      throw new BadRequestException('Nenhum arquivo fornecido');
    }
    console.log('Arquivo recebido no controller:', file.originalname, file.size, file.mimetype);
    return this.profileService.updateAvatar(req.user.id, file);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Atualizar minha senha' })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  updateMyPassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.profileService.updatePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Get('me/activity')
  @ApiOperation({ summary: 'Buscar atividades recentes' })
  @ApiResponse({ status: 200, description: 'Atividades recentes retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  getRecentActivity(@Request() req) {
    return this.profileService.getRecentActivity(req.user.id);
  }
}