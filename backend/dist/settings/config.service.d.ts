import { PrismaService } from '../common/prisma/prisma.service';
export declare class ConfigService {
    private prisma;
    private settings;
    constructor(prisma: PrismaService);
    loadSettings(): Promise<void>;
    get(key: string, defaultValue?: string): string | undefined;
    set(key: string, value: string, description?: string, category?: string): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAll(): {
        [k: string]: string;
    };
}
