import { PerformanceEvaluationsService } from './performance-evaluations.service';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
export declare class PerformanceEvaluationsController {
    private readonly performanceEvaluationsService;
    constructor(performanceEvaluationsService: PerformanceEvaluationsService);
    create(createPerformanceEvaluationDto: CreatePerformanceEvaluationDto): Promise<{
        users_performance_evaluations_evaluator_idTousers: {
            id: string;
            email: string;
            name: string;
        };
        users_performance_evaluations_user_idTousers: {
            position: {
                name: string;
            };
            department: {
                name: string;
            };
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        user_id: string;
        period: string;
        score: number;
        goals: string | null;
        achievements: string | null;
        feedback: string | null;
        evaluator_id: string;
    }>;
    findAll(page?: string, limit?: string, userId?: string, evaluatorId?: string, period?: string): Promise<{
        data: ({
            users_performance_evaluations_evaluator_idTousers: {
                id: string;
                email: string;
                name: string;
            };
            users_performance_evaluations_user_idTousers: {
                position: {
                    name: string;
                };
                department: {
                    name: string;
                };
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            user_id: string;
            period: string;
            score: number;
            goals: string | null;
            achievements: string | null;
            feedback: string | null;
            evaluator_id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByUser(userId: string, page?: string, limit?: string): Promise<{
        data: ({
            users_performance_evaluations_evaluator_idTousers: {
                id: string;
                email: string;
                name: string;
            };
            users_performance_evaluations_user_idTousers: {
                position: {
                    name: string;
                };
                department: {
                    name: string;
                };
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            user_id: string;
            period: string;
            score: number;
            goals: string | null;
            achievements: string | null;
            feedback: string | null;
            evaluator_id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByEvaluator(evaluatorId: string, page?: string, limit?: string): Promise<{
        data: ({
            users_performance_evaluations_evaluator_idTousers: {
                id: string;
                email: string;
                name: string;
            };
            users_performance_evaluations_user_idTousers: {
                position: {
                    name: string;
                };
                department: {
                    name: string;
                };
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            user_id: string;
            period: string;
            score: number;
            goals: string | null;
            achievements: string | null;
            feedback: string | null;
            evaluator_id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByPeriod(period: string, page?: string, limit?: string): Promise<{
        data: ({
            users_performance_evaluations_evaluator_idTousers: {
                id: string;
                email: string;
                name: string;
            };
            users_performance_evaluations_user_idTousers: {
                position: {
                    name: string;
                };
                department: {
                    name: string;
                };
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            user_id: string;
            period: string;
            score: number;
            goals: string | null;
            achievements: string | null;
            feedback: string | null;
            evaluator_id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        users_performance_evaluations_evaluator_idTousers: {
            id: string;
            email: string;
            name: string;
        };
        users_performance_evaluations_user_idTousers: {
            position: {
                name: string;
            };
            department: {
                name: string;
            };
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        user_id: string;
        period: string;
        score: number;
        goals: string | null;
        achievements: string | null;
        feedback: string | null;
        evaluator_id: string;
    }>;
    update(id: string, updatePerformanceEvaluationDto: UpdatePerformanceEvaluationDto): Promise<{
        users_performance_evaluations_evaluator_idTousers: {
            id: string;
            email: string;
            name: string;
        };
        users_performance_evaluations_user_idTousers: {
            position: {
                name: string;
            };
            department: {
                name: string;
            };
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        user_id: string;
        period: string;
        score: number;
        goals: string | null;
        achievements: string | null;
        feedback: string | null;
        evaluator_id: string;
    }>;
    approve(id: string, req: any): Promise<{
        users_performance_evaluations_evaluator_idTousers: {
            id: string;
            email: string;
            name: string;
        };
        users_performance_evaluations_user_idTousers: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        user_id: string;
        period: string;
        score: number;
        goals: string | null;
        achievements: string | null;
        feedback: string | null;
        evaluator_id: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        user_id: string;
        period: string;
        score: number;
        goals: string | null;
        achievements: string | null;
        feedback: string | null;
        evaluator_id: string;
    }>;
}
