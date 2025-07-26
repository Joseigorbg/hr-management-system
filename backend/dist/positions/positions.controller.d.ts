import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
export declare class PositionsController {
    private readonly positionsService;
    constructor(positionsService: PositionsService);
    findAll(page?: string, limit?: string, search?: string): Promise<{
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
    test(): {
        message: string;
    };
    create(createPositionDto: CreatePositionDto): Promise<{
        data: {
            data: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                salary: number | null;
                status: string;
            };
        };
        status: number;
    }>;
    findOne(id: string): Promise<{
        data: {
            data: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                salary: number | null;
                status: string;
            };
        };
    }>;
    update(id: string, updatePositionDto: UpdatePositionDto): Promise<{
        data: {
            data: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                salary: number | null;
                status: string;
            };
        };
    }>;
    remove(id: string): Promise<{
        message: string;
        status: number;
    }>;
}
