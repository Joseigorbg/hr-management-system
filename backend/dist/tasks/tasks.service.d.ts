import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-tasks.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page: number, limit: number, filters: {
        userId?: string;
        startDate?: string;
        endDate?: string;
        isActive?: boolean;
        currentUserId?: string;
    }): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        group: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        groupId: string | null;
        trainingId: string | null;
    })[]>;
    create(dto: CreateTaskDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        group: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        groupId: string | null;
        trainingId: string | null;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        group: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        groupId: string | null;
        trainingId: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        groupId: string | null;
        trainingId: string | null;
    }>;
    assignTask(dto: AssignTaskDto, requesterRole: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        group: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        groupId: string | null;
        trainingId: string | null;
    }>;
    unassignTask(type: 'user' | 'group', id: string, taskId: string, requesterRole: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        group: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string | null;
        startDate: Date;
        endDate: Date;
        title: string;
        groupId: string | null;
        trainingId: string | null;
    }>;
}
