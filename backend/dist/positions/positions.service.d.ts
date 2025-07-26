import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
export declare class PositionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private withRetry;
    create(createPositionDto: CreatePositionDto): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
    }>;
    update(id: string, updatePositionDto: UpdatePositionDto): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
