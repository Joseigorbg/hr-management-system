import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    create(createSettingDto: CreateSettingDto): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: string, limit?: string, category?: string): Promise<{
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
    backup(): Promise<{
        message: string;
        path: string;
    }>;
    restore(file: Express.Multer.File): Promise<{
        message: string;
        results: any[];
    }>;
    getPermissions(): {
        id: string;
        name: string;
        key: string;
    }[];
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
    bulkUpdate(settings: {
        key: string;
        value: string;
    }[]): Promise<any[]>;
    findByKey(key: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateByKey(key: string, body: {
        value: string;
    }): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
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
    update(id: string, updateSettingDto: UpdateSettingDto): Promise<{
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
}
