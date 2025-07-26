declare enum EvaluationStatus {
    pending = "pending",
    completed = "completed",
    approved = "approved"
}
export declare class CreatePerformanceEvaluationDto {
    userId: string;
    evaluatorId: string;
    period: string;
    score: number;
    goals?: string;
    achievements?: string;
    feedback?: string;
    status: EvaluationStatus;
}
export {};
