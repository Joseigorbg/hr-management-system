import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTrainingDto, UpdateTrainingDto, UpdateProgressDto } from './dto';
import { Training, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<Training[]> {
    const skip = (page - 1) * limit;
    const where: Prisma.TrainingWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { instructor: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const trainings = await this.prisma.training.findMany({
      where,
      skip,
      take: limit,
      include: {
        instructor: true,
        training_participations: true, // Include participations to calculate count
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to include participantCount
    return trainings.map(training => ({
      ...training,
      participantCount: training.training_participations.length,
    }));
  }

  async findOneDetailed(id: string): Promise<any> {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        instructor: true,
        training_participations: {
          include: {
            users: true,
            documents: true,
          },
        },
        tasks: true,
      },
    });

    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    return {
      ...training,
      participants: training.training_participations.map((pt) => ({
        user: pt.users,
        documents: pt.documents,
        progress: pt.progress,
        status: pt.status,
      })),
      taskCount: training.tasks.length,
      completedTasks: training.tasks.filter((t) => !t.isActive).length,
    };
  }

  async create(createTrainingDto: CreateTrainingDto, file?: Express.Multer.File, userId?: string): Promise<Training> {
    const { name, description, startDate, endDate, maxParticipants, status, progress, instructorId } = createTrainingDto;

    if (!name || !startDate || !endDate) {
      throw new BadRequestException('Nome, data de início e data de término são obrigatórios');
    }

    if (progress !== null && (isNaN(progress) || progress < 0 || progress > 100)) {
      throw new BadRequestException('Progresso deve ser um número entre 0 e 100 ou null');
    }

    return this.prisma.$transaction(async (prisma) => {
      const training = await prisma.training.create({
        data: {
          name,
          description: description || null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxParticipants: maxParticipants ?? null,
          status: status || 'scheduled',
          progress: progress ?? null,
          instructorId: instructorId || null,
        },
        include: { instructor: true },
      });

      if (file && userId) {
        const userTraining = await prisma.userTraining.findFirst({
          where: { user_id: userId, training_id: training.id },
        });

        if (!userTraining) {
          await prisma.userTraining.create({
            data: {
              id: randomUUID(),
              user_id: userId,
              training_id: training.id,
              enrolledAt: new Date(),
              status: 'enrolled',
            },
          });
        }

        const existingUserTraining = await prisma.userTraining.findFirst({
          where: { user_id: userId, training_id: training.id },
        });

        await prisma.trainingDocument.create({
          data: {
            id: randomUUID(),
            userTrainingId: existingUserTraining.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            uploadedAt: new Date(),
            uploadedBy: userId,
          },
        });
      }

      return training;
    });
  }

  async update(id: string, updateTrainingDto: UpdateTrainingDto, file?: Express.Multer.File, userId?: string): Promise<Training> {
    const existingTraining = await this.prisma.training.findUnique({ where: { id } });
    if (!existingTraining) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    const { name, description, startDate, endDate, maxParticipants, status, progress, instructorId } = updateTrainingDto;

    if (progress !== undefined && progress !== null && (isNaN(progress) || progress < 0 || progress > 100)) {
      throw new BadRequestException('Progresso deve ser um número entre 0 e 100 ou null');
    }

    return this.prisma.$transaction(async (prisma) => {
      const training = await prisma.training.update({
        where: { id },
        data: {
          name: name ?? existingTraining.name,
          description: description ?? existingTraining.description,
          startDate: startDate ? new Date(startDate) : existingTraining.startDate,
          endDate: endDate ? new Date(endDate) : existingTraining.endDate,
          maxParticipants: maxParticipants ?? existingTraining.maxParticipants,
          status: status ?? existingTraining.status,
          progress: progress ?? existingTraining.progress,
          instructorId: instructorId !== undefined ? (instructorId || null) : existingTraining.instructorId,
        },
        include: { instructor: true },
      });

      if (file && userId) {
        const userTraining = await prisma.userTraining.findFirst({
          where: { user_id: userId, training_id: training.id },
        });

        if (!userTraining) {
          await prisma.userTraining.create({
            data: {
              id: randomUUID(),
              user_id: userId,
              training_id: training.id,
              enrolledAt: new Date(),
              status: 'enrolled',
            },
          });
        }

        const existingUserTraining = await prisma.userTraining.findFirst({
          where: { user_id: userId, training_id: training.id },
        });

        await prisma.trainingDocument.create({
          data: {
            id: randomUUID(),
            userTrainingId: existingUserTraining.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            uploadedAt: new Date(),
            uploadedBy: userId,
          },
        });
      }

      return training;
    });
  }

  async updateProgress(id: string, progress: number): Promise<Training> {
    if (isNaN(progress) || progress < 0 || progress > 100) {
      throw new BadRequestException('Progresso deve estar entre 0 e 100');
    }
    const training = await this.prisma.training.update({
      where: { id },
      data: { progress },
      include: { instructor: true },
    });
    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }
    return training;
  }

  async remove(id: string): Promise<void> {
    const training = await this.prisma.training.findUnique({ where: { id } });
    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    await this.prisma.training.delete({ where: { id } });
  }
}