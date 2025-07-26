import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
export declare class ReportsService {
    private prisma;
    private readonly uploadDir;
    constructor(prisma: PrismaService);
    private ensureUploadDirectory;
    listUploadedFiles(): Promise<string[]>;
    create(createReportDto: CreateReportDto, generated_by: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    findAll(page?: number, limit?: number, type?: string, generated_by?: string): Promise<{
        data: ({
            users: {
                id: string;
                email: string;
                name: string;
            };
            documents: {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                filePath: string;
                reportId: string;
                uploaded_at: Date;
                uploaded_by: string | null;
            }[];
        } & {
            id: string;
            name: string;
            type: string;
            frequency: string | null;
            scheduledDate: Date | null;
            generated_by: string;
            created_at: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    update(id: string, updateReportDto: UpdateReportDto): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    uploadDocument(uploadDocumentDto: UploadDocumentDto & {
        files: Express.Multer.File[];
    }): Promise<{
        id: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        reportId: string;
        uploaded_at: Date;
        uploaded_by: string | null;
    }[]>;
    downloadDocument(id: string): Promise<{
        fileName: string;
        fileType: string;
        buffer: Buffer<ArrayBufferLike>;
    }>;
    findDocumentsByReportId(reportId: string): Promise<{
        id: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        reportId: string;
        uploaded_at: Date;
        uploaded_by: string;
    }[]>;
    generateEmployeesReport(filters: any, generated_by: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    generatePerformanceReport(filters: any, generated_by: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    generateTasksReport(filters: any, generated_by: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    generateAdmissionsReport(filters: any, generated_by: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        };
        documents: {
            id: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            reportId: string;
            uploaded_at: Date;
            uploaded_by: string | null;
        }[];
    } & {
        id: string;
        name: string;
        type: string;
        frequency: string | null;
        scheduledDate: Date | null;
        generated_by: string;
        created_at: Date;
    }>;
    getReportTypes(): Promise<string[]>;
}
