import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-tasks.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(req: any, page?: string, limit?: string, userId?: string, startDate?: string, endDate?: string, isActive?: string): Promise<({
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
    create(createTaskDto: CreateTaskDto): Promise<{
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
    assignTask(assignTaskDto: AssignTaskDto, req: any): Promise<{
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
    unassignTask(type: 'user' | 'group', id: string, taskId: string, req: any): Promise<{
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
