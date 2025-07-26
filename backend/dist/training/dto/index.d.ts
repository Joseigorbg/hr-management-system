export declare class CreateTrainingDto {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    maxParticipants?: number;
    status: string;
    progress?: number | null;
    instructorId?: string | null;
}
export declare class UpdateTrainingDto {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
    status?: string;
    progress?: number | null;
    instructorId?: string | null;
}
export declare class UpdateProgressDto {
    progress: number;
}
export declare class AddParticipantDto {
    userId: string;
    progress?: number;
}
