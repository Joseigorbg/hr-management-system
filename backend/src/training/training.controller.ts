import { Controller, Get, Post, Patch, Delete, Query, Body, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Req, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto, UpdateTrainingDto, UpdateProgressDto, AddParticipantDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../common/prisma/prisma.service';
import { v4 as randomUUID } from 'uuid';

@Controller('trainings')
@UseGuards(AuthGuard('jwt'))
export class TrainingController {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const trainings = await this.trainingService.findAll(parseInt(page), parseInt(limit), search);
    return { data: trainings };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const training = await this.trainingService.findOneDetailed(id);
    return { data: training };
  }

  @Post()
  @UseInterceptors(FileInterceptor('document'))
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @Req() request: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        exceptionFactory: (error) => {
          console.error('File validation error:', error);
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    ) file?: Express.Multer.File,
  ) {
    console.log('Received raw request body:', request.body);
    console.log('Received createTrainingDto:', createTrainingDto);
    console.log('Uploaded file:', file);
    if (file) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`,
        );
      }
    }
    const userId = request.user.id;
    const training = await this.trainingService.create(createTrainingDto, file, userId);
    return { data: training, message: 'Treinamento criado com sucesso' };
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('document'))
  async update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @Req() request: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        exceptionFactory: (error) => {
          console.error('File validation error:', error);
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    ) file?: Express.Multer.File,
  ) {
    console.log('Received updateTrainingDto:', updateTrainingDto);
    console.log('Uploaded file:', file);
    if (file) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`,
        );
      }
    }
    const userId = request.user.id;
    const training = await this.trainingService.update(id, updateTrainingDto, file, userId);
    return { data: training, message: 'Treinamento atualizado com sucesso' };
  }

  @Patch(':id/progress')
  async updateProgress(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto) {
    const training = await this.trainingService.updateProgress(id, updateProgressDto.progress);
    return { data: training, message: 'Progresso atualizado com sucesso' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.trainingService.remove(id);
    return { message: 'Treinamento excluído com sucesso' };
  }

  @Post(':id/participants')
  @UseInterceptors(FileInterceptor('document'))
  async addParticipant(
    @Param('id') id: string,
    @Body() addParticipantDto: AddParticipantDto,
    @Req() request: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        exceptionFactory: (error) => {
          console.error('File validation error:', error);
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    ) file?: Express.Multer.File,
  ) {
    const { userId, progress = 0 } = addParticipantDto;
    const training = await this.trainingService.findOneDetailed(id);
    if (!training) throw new NotFoundException('Treinamento não encontrado');

    if (isNaN(progress) || progress < 0 || progress > 100) {
      throw new BadRequestException('Progresso deve ser um número entre 0 e 100');
    }

    const userTraining = await this.prisma.userTraining.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        training_id: id,
        enrolledAt: new Date(),
        status: 'enrolled',
        progress: progress,
      },
    });

    if (file) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`,
        );
      }
      await this.prisma.trainingDocument.create({
        data: {
          id: randomUUID(),
          userTrainingId: userTraining.id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: `/uploads/participants/${file.originalname}`,
          uploadedAt: new Date(),
          uploadedBy: request.user.id,
        },
      });
    }

    return { data: userTraining, message: 'Participante adicionado com sucesso' };
  }

  @Patch(':id/participants/:userId/progress')
  async updateParticipantProgress(
    @Param('id') trainingId: string,
    @Param('userId') userId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    console.log('Received updateProgressDto:', updateProgressDto);
    const training = await this.trainingService.findOneDetailed(trainingId);
    if (!training) throw new NotFoundException('Treinamento não encontrado');

    const userTraining = await this.prisma.userTraining.findFirst({
      where: {
        training_id: trainingId,
        user_id: userId,
      },
    });
    if (!userTraining) throw new NotFoundException('Participante não encontrado no treinamento');

    const updatedUserTraining = await this.prisma.userTraining.update({
      where: { id: userTraining.id },
      data: { progress: updateProgressDto.progress },
    });

    return { data: updatedUserTraining, message: 'Progresso do participante atualizado com sucesso' };
  }

  @Post(':id/participants/:userId/documents')
  @UseInterceptors(FileInterceptor('document'))
  async uploadParticipantDocument(
    @Param('id') trainingId: string,
    @Param('userId') userId: string,
    @Req() request: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        exceptionFactory: (error) => {
          console.error('File validation error:', error);
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    ) file: Express.Multer.File,
  ) {
    const training = await this.trainingService.findOneDetailed(trainingId);
    if (!training) throw new NotFoundException('Treinamento não encontrado');

    const userTraining = await this.prisma.userTraining.findFirst({
      where: { training_id: trainingId, user_id: userId },
    });
    if (!userTraining) throw new NotFoundException('Participante não encontrado no treinamento');

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`,
      );
    }

    const document = await this.prisma.trainingDocument.create({
      data: {
        id: randomUUID(),
        userTrainingId: userTraining.id,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: `/uploads/participants/${file.originalname}`,
        uploadedAt: new Date(),
        uploadedBy: request.user.id,
      },
    });

    return { data: document, message: 'Documento enviado com sucesso' };
  }
}