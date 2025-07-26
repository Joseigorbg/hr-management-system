import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSupporterDto } from './dto/create-supporter.dto';
import { UpdateSupporterDto } from './dto/update-supporter.dto';
export declare class SupporterService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(page: number, limit: number, search?: string, status?: string): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            address: string;
            phone: string;
            cep: string;
            mapping: string;
            supportType: string;
            lat: number | null;
            lng: number | null;
        }[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        address: string;
        phone: string;
        cep: string;
        mapping: string;
        supportType: string;
        lat: number | null;
        lng: number | null;
    }>;
    create(createSupporterDto: CreateSupporterDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        address: string;
        phone: string;
        cep: string;
        mapping: string;
        supportType: string;
        lat: number | null;
        lng: number | null;
    }>;
    update(id: string, updateSupporterDto: UpdateSupporterDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        address: string;
        phone: string;
        cep: string;
        mapping: string;
        supportType: string;
        lat: number | null;
        lng: number | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
