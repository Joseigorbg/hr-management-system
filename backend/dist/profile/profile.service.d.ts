import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            position: {
                id: string;
                name: string;
                description: string;
                salary: number;
            };
            department: {
                id: string;
                name: string;
                description: string;
            };
            id: string;
            email: string;
            name: string;
            role: string;
            isActive: boolean;
            last_login: Date;
            createdAt: Date;
            updatedAt: Date;
            surname: string;
            admissions: {
                salary: number;
                status: string;
                hireDate: Date;
                contractType: string;
            };
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
    findByUser(userId: string): Promise<{
        user: {
            position: {
                id: string;
                name: string;
                description: string;
                salary: number;
            };
            department: {
                id: string;
                name: string;
                description: string;
            };
            id: string;
            email: string;
            name: string;
            role: string;
            isActive: boolean;
            last_login: Date;
            createdAt: Date;
            updatedAt: Date;
            surname: string;
            admissions: {
                salary: number;
                status: string;
                hireDate: Date;
                contractType: string;
            };
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
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        user: {
            position: {
                name: string;
            };
            department: {
                name: string;
            };
            id: string;
            email: string;
            name: string;
            role: string;
            surname: string;
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
    updateAvatar(userId: string, avatarFile: Express.Multer.File): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            surname: string;
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
    updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
    getRecentActivity(userId: string): Promise<unknown>;
}
