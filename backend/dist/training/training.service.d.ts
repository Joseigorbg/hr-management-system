import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTrainingDto, UpdateTrainingDto } from './dto';
import { Training } from '@prisma/client';
export declare class TrainingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string): Promise<Training[]>;
    findOneDetailed(id: string): Promise<any>;
    create(createTrainingDto: CreateTrainingDto, file?: Express.Multer.File, userId?: string): Promise<Training>;
    update(id: string, updateTrainingDto: UpdateTrainingDto, file?: Express.Multer.File, userId?: string): Promise<Training>;
    updateProgress(id: string, progress: number): Promise<Training>;
    remove(id: string): Promise<void>;
}
