import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Response } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, files?: Express.Multer.File[]): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string;
        positionId: string;
        surname: string;
        admissions: {
            id: string;
            salary: number;
            status: string;
            hireDate: Date;
            contractType: string;
            benefits: string;
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
            }[];
        };
    }>;
    findAll(page?: string, limit?: string, search?: string, status?: string): Promise<{
        data: ({
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                phone: string | null;
                birthDate: Date | null;
                document: string | null;
                emergencyContact: string | null;
                avatar: string | null;
                bio: string | null;
                user_id: string;
            };
            position: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                salary: number | null;
                status: string;
            };
            department: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                managerId: string | null;
            };
            admissions: {
                id: string;
                salary: number;
                status: string;
                hireDate: Date;
                contractType: string;
                benefits: string;
                documents: {
                    id: string;
                    fileName: string;
                    fileType: string;
                    fileSize: number;
                    filePath: string;
                    uploadedAt: Date;
                }[];
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findUsers(name?: string, email?: string, status?: 'active' | 'vacation' | 'inactive' | 'terminated'): Promise<({
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        position: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
        admissions: {
            id: string;
            status: string;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        position: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
        admissions: {
            id: string;
            salary: number;
            status: string;
            hireDate: Date;
            contractType: string;
            benefits: string;
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
            }[];
        };
    } & {
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
    }>;
    update(id: string, updateUserDto: UpdateUserDto, files?: Express.Multer.File[]): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        position: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
        admissions: {
            id: string;
            salary: number;
            status: string;
            hireDate: Date;
            contractType: string;
            benefits: string;
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
            }[];
        };
    } & {
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
    }>;
    remove(id: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        position: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
        admissions: {
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
            }[];
        } & {
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
        };
    } & {
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
    }>;
    activate(id: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        position: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
        admissions: {
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
            }[];
        } & {
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
        };
    } & {
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
    }>;
    uploadDocument(id: string, files: Express.Multer.File[]): Promise<{
        id: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        uploadedAt: Date;
    }>;
    deleteDocument(userId: string, documentId: string): Promise<{
        message: string;
    }>;
    getDocument(userId: string, documentId: string, res: Response): Promise<void>;
    updateProfile(req: any, updateData: UpdateProfileDto): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            birthDate: Date | null;
            document: string | null;
            emergencyContact: string | null;
            avatar: string | null;
            bio: string | null;
            user_id: string;
        };
        position: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            salary: number | null;
            status: string;
        };
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            managerId: string | null;
        };
        admissions: {
            id: string;
            salary: number;
            status: string;
            hireDate: Date;
            contractType: string;
            benefits: string;
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
            }[];
        };
    } & {
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
    }>;
    updateAvatar(req: any, file: Express.Multer.File): Promise<{
        user: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        birthDate: Date | null;
        document: string | null;
        emergencyContact: string | null;
        avatar: string | null;
        bio: string | null;
        user_id: string;
    }>;
}
