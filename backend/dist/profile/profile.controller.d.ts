import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getMyProfile(req: any): Promise<{
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
    updateMyProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
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
    updateMyAvatar(req: any, file: Express.Multer.File): Promise<{
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
    updateMyPassword(req: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
    getRecentActivity(req: any): Promise<unknown>;
}
