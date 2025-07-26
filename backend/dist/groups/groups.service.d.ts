import { PrismaService } from '../common/prisma/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    private withRetry;
    findAll(): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            users: {
                id: string;
                name: string;
                email: string;
            }[];
        }[];
    }>;
    create(name: string, description?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addUserToGroup(groupId: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string;
        users: {
            id: string;
            name: string;
            email: string;
        }[];
    }>;
}
