import { TrainingService } from './training.service';
import { CreateTrainingDto, UpdateTrainingDto, UpdateProgressDto, AddParticipantDto } from './dto';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class TrainingController {
    private readonly trainingService;
    private readonly prisma;
    constructor(trainingService: TrainingService, prisma: PrismaService);
    findAll(page?: string, limit?: string, search?: string): Promise<{
        data: {
            name: string;
            id: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            maxParticipants: number | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            progress: number | null;
            instructorId: string | null;
        }[];
    }>;
    findOne(id: string): Promise<{
        data: any;
    }>;
    create(createTrainingDto: CreateTrainingDto, request: any, file?: Express.Multer.File): Promise<{
        data: {
            name: string;
            id: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            maxParticipants: number | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            progress: number | null;
            instructorId: string | null;
        };
        message: string;
    }>;
    update(id: string, updateTrainingDto: UpdateTrainingDto, request: any, file?: Express.Multer.File): Promise<{
        data: {
            name: string;
            id: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            maxParticipants: number | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            progress: number | null;
            instructorId: string | null;
        };
        message: string;
    }>;
    updateProgress(id: string, updateProgressDto: UpdateProgressDto): Promise<{
        data: {
            name: string;
            id: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            maxParticipants: number | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            progress: number | null;
            instructorId: string | null;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addParticipant(id: string, addParticipantDto: AddParticipantDto, request: any, file?: Express.Multer.File): Promise<{
        data: {
            id: string;
            status: string;
            progress: number | null;
            enrolledAt: Date;
            completedAt: Date | null;
            score: number | null;
            certificate: string | null;
            training_id: string;
            user_id: string;
        };
        message: string;
    }>;
    updateParticipantProgress(trainingId: string, userId: string, updateProgressDto: UpdateProgressDto): Promise<{
        data: {
            id: string;
            status: string;
            progress: number | null;
            enrolledAt: Date;
            completedAt: Date | null;
            score: number | null;
            certificate: string | null;
            training_id: string;
            user_id: string;
        };
        message: string;
    }>;
    uploadParticipantDocument(trainingId: string, userId: string, request: any, file: Express.Multer.File): Promise<{
        data: {
            id: string;
            userTrainingId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
        };
        message: string;
    }>;
}
