import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
    }>;
    findAll(page?: string, limit?: string, search?: string, include?: string): Promise<{
        data: ({
            admissions: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                salary: number | null;
                status: string;
                user_id: string;
                hireDate: Date;
                contractType: string;
                benefits: string | null;
                terminationDate: Date | null;
                terminationReason: string | null;
                position_id: string | null;
                department_id: string | null;
            }[];
            _count: {
                users: number;
                admissions: number;
            };
            users: {
                id: string;
                email: string;
                password_hash: string;
                name: string;
                role: string;
                isActive: boolean;
                last_login: Date | null;
                createdAt: Date;
                updatedAt: Date;
                departmentId: string | null;
                positionId: string | null;
                surname: string | null;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: {
            users: {
                id: string;
                email: string;
                name: string;
                surname: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
    }>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
