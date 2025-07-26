import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './Uploads/reports',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
          console.log('Multer: Gerando nome de arquivo:', { originalname: file.originalname, uniqueSuffix });
          callback(null, uniqueSuffix);
        },
      }),
      fileFilter: (req, file, callback) => {
        console.log('Multer: Verificando arquivo:', {
          file: file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            bufferLength: file.buffer?.length,
          } : 'Arquivo ausente',
          requestBody: req.body,
        });

        if (!file) {
          console.error('Multer: Nenhum arquivo enviado');
          return callback(new BadRequestException('Nenhum arquivo enviado'), false);
        }

        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
          'application/msword', // DOC
          'application/vnd.ms-excel', // XLS
          'text/plain', // TXT
          'image/jpeg', // JPG
          'image/png', // PNG
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          console.error('Multer: Tipo de arquivo não permitido:', file.mimetype);
          return callback(
            new BadRequestException('Tipo de arquivo não permitido. Apenas PDF, DOCX, XLSX, DOC, XLS, TXT, JPG e PNG são suportados.'),
            false,
          );
        }

        callback(null, true);
      },
      // Removido o limite de tamanho de arquivo
    }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PrismaService],
})
export class ReportsModule {}