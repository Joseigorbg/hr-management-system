import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(createReportDto: CreateReportDto, req: any): Promise<{
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
    listUploadedFiles(): Promise<{
        files: string[];
    }>;
    findAll(page?: string, limit?: string, type?: string, generatedBy?: string): Promise<{
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
    update(id: string, updateReportDto: UpdateReportDto, req: any): Promise<{
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
    uploadDocument(files: Express.Multer.File[], uploadDocumentDto: UploadDocumentDto, req: any): Promise<{
        id: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        reportId: string;
        uploaded_at: Date;
        uploaded_by: string | null;
    }[]>;
    downloadDocument(id: string, res: Response): Promise<void>;
    getReportTypes(): Promise<string[]>;
    generateReport(type: string, filters: any, req: any, res: Response): Promise<void>;
    getDocumentsByReportId(id: string): Promise<{
        id: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        reportId: string;
        uploaded_at: Date;
        uploaded_by: string;
    }[]>;
}
