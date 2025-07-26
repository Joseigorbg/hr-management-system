import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ConfigService } from './config.service';
export declare class SettingsService {
    private prisma;
    private nestConfigService;
    private configService;
    private s3;
    constructor(prisma: PrismaService, nestConfigService: NestConfigService, configService: ConfigService);
    create(createSettingDto: CreateSettingDto): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: number, limit?: number, category?: string): Promise<{
        data: {
            id: string;
            key: string;
            value: string;
            description: string | null;
            category: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    backup(): Promise<{
        message: string;
        path: string;
    }>;
    restore(data: any): Promise<{
        message: string;
        results: any[];
    }>;
    findOne(id: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByKey(key: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateSettingDto: UpdateSettingDto): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateByKey(key: string, value: string, description?: string, category?: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCategories(): Promise<string[]>;
    getSettingsByCategory(category: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    bulkUpdate(settings: {
        key: string;
        value: string;
        description?: string;
        category?: string;
    }[]): Promise<any[]>;
    getSystemSettings(): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getNotificationSettings(): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getSecuritySettings(): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    initializeDefaultSettings(): Promise<any[]>;
}
