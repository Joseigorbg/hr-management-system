import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            // Determina o destino com base no contexto da requisição
            const isParticipantDocument = req.route?.path.includes('/participants');
            const basePath = join(__dirname, '..', '..', 'uploads');
            const destinationPath = isParticipantDocument
              ? join(basePath, 'participants')
              : join(basePath, 'training_documents');
            cb(null, destinationPath);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
          },
        }),
      }),
    }),
  ],
  controllers: [TrainingController],
  providers: [TrainingService, PrismaService],
})
export class TrainingModule {}