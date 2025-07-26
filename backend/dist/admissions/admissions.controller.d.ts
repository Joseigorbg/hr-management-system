import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
export declare class AdmissionsController {
    private readonly admissionsService;
    constructor(admissionsService: AdmissionsService);
    create(createAdmissionDto: CreateAdmissionDto, files?: Express.Multer.File[]): Promise<{
        user: {
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
            surname: string;
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
        documents: {
            id: string;
            admissionId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
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
    }>;
    uploadDocument(admissionId: string, files: Express.Multer.File[], user: any): Promise<any[]>;
    deleteDocument(admissionId: string, documentId: string): Promise<{
        id: string;
        admissionId: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        uploadedAt: Date;
        uploadedBy: string | null;
    }>;
    findAll(page?: string, limit?: string, status?: string, search?: string): Promise<{
        data: ({
            user: {
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
                surname: string;
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
            documents: {
                id: string;
                admissionId: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
                uploadedBy: string | null;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByDateRange(startDate: string, endDate: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
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
                surname: string;
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
            documents: {
                id: string;
                admissionId: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                uploadedAt: Date;
                uploadedBy: string | null;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByUser(userId: string): Promise<({
        user: {
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
            surname: string;
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
        documents: {
            id: string;
            admissionId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
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
    })[]>;
    findOne(id: string): Promise<{
        user: {
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
            surname: string;
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
        documents: {
            id: string;
            admissionId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
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
    }>;
    update(id: string, updateAdmissionDto: UpdateAdmissionDto, files?: Express.Multer.File[], user?: any): Promise<{
        user: {
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
            surname: string;
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
        documents: {
            id: string;
            admissionId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
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
    }>;
    terminate(id: string, body: {
        terminationDate?: string;
        terminationReason?: string;
    }): Promise<{
        user: {
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
            surname: string;
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
        documents: {
            id: string;
            admissionId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
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
    }>;
    reactivate(id: string): Promise<{
        user: {
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
            surname: string;
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
        documents: {
            id: string;
            admissionId: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedAt: Date;
            uploadedBy: string | null;
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
