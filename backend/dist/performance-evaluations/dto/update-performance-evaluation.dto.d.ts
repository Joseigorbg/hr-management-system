import { EvaluationStatus } from '../entities/performance-evaluation.entity';
export declare class UpdatePerformanceEvaluationDto {
    userId?: string;
    evaluatorId?: string;
    period?: string;
    score?: number;
    goals?: string;
    achievements?: string;
    feedback?: string;
    status?: EvaluationStatus;
}
