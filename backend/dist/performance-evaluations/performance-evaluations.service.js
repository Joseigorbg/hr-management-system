"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceEvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let PerformanceEvaluationsService = class PerformanceEvaluationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPerformanceEvaluationDto) {
        console.log('Recebido DTO para criação no serviço:', JSON.stringify(createPerformanceEvaluationDto, null, 2));
        try {
            const [user, evaluator] = await Promise.all([
                this.prisma.user.findUnique({ where: { id: createPerformanceEvaluationDto.userId } }),
                this.prisma.user.findUnique({ where: { id: createPerformanceEvaluationDto.evaluatorId } }),
            ]);
            console.log('Resultado da busca:', {
                user: user ? { id: user.id, name: user.name, email: user.email } : null,
                evaluator: evaluator ? { id: evaluator.id, name: evaluator.name, email: evaluator.email } : null,
            });
            if (!user) {
                throw new common_1.NotFoundException(`Usuário com ID ${createPerformanceEvaluationDto.userId} não encontrado`);
            }
            if (!evaluator) {
                throw new common_1.NotFoundException(`Avaliador com ID ${createPerformanceEvaluationDto.evaluatorId} não encontrado`);
            }
            const existingEvaluation = await this.prisma.performanceEvaluation.findFirst({
                where: {
                    user_id: createPerformanceEvaluationDto.userId,
                    period: createPerformanceEvaluationDto.period,
                },
            });
            if (existingEvaluation) {
                throw new common_1.BadRequestException(`Já existe uma avaliação para o usuário ${createPerformanceEvaluationDto.userId} no período ${createPerformanceEvaluationDto.period}`);
            }
            const evaluation = await this.prisma.performanceEvaluation.create({
                data: {
                    user_id: createPerformanceEvaluationDto.userId,
                    evaluator_id: createPerformanceEvaluationDto.evaluatorId,
                    period: createPerformanceEvaluationDto.period,
                    score: createPerformanceEvaluationDto.score,
                    goals: createPerformanceEvaluationDto.goals,
                    achievements: createPerformanceEvaluationDto.achievements,
                    feedback: createPerformanceEvaluationDto.feedback,
                    status: createPerformanceEvaluationDto.status || 'pending',
                },
                include: {
                    users_performance_evaluations_user_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            position: { select: { name: true } },
                            department: { select: { name: true } },
                        },
                    },
                    users_performance_evaluations_evaluator_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            console.log('Avaliação criada com sucesso:', JSON.stringify(evaluation, null, 2));
            return evaluation;
        }
        catch (error) {
            console.error('Erro ao criar a avaliação:', {
                message: error.message,
                stack: error.stack,
                dto: JSON.stringify(createPerformanceEvaluationDto, null, 2),
                code: error.code,
            });
            throw error;
        }
    }
    async findAll(page = 1, limit = 10, userId, evaluatorId, period) {
        const skip = (page - 1) * limit;
        const where = {};
        if (userId)
            where.user_id = userId;
        if (evaluatorId)
            where.evaluator_id = evaluatorId;
        if (period)
            where.period = period;
        const [evaluations, total] = await Promise.all([
            this.prisma.performanceEvaluation.findMany({
                where,
                skip,
                take: limit,
                include: {
                    users_performance_evaluations_user_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            position: { select: { name: true } },
                            department: { select: { name: true } },
                        },
                    },
                    users_performance_evaluations_evaluator_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.performanceEvaluation.count({ where }),
        ]);
        return {
            data: evaluations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const evaluation = await this.prisma.performanceEvaluation.findUnique({
            where: { id },
            include: {
                users_performance_evaluations_user_idTousers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: { select: { name: true } },
                        department: { select: { name: true } },
                    },
                },
                users_performance_evaluations_evaluator_idTousers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException('Avaliação de desempenho não encontrada');
        }
        return evaluation;
    }
    async update(id, updatePerformanceEvaluationDto) {
        try {
            const existingEvaluation = await this.findOne(id);
            if (updatePerformanceEvaluationDto.userId && updatePerformanceEvaluationDto.period) {
                const duplicateEvaluation = await this.prisma.performanceEvaluation.findFirst({
                    where: {
                        user_id: updatePerformanceEvaluationDto.userId,
                        period: updatePerformanceEvaluationDto.period,
                        id: { not: id },
                    },
                });
                if (duplicateEvaluation) {
                    throw new common_1.BadRequestException(`Já existe uma avaliação para o usuário ${updatePerformanceEvaluationDto.userId} no período ${updatePerformanceEvaluationDto.period}`);
                }
            }
            if (updatePerformanceEvaluationDto.userId) {
                const user = await this.prisma.user.findUnique({ where: { id: updatePerformanceEvaluationDto.userId } });
                if (!user) {
                    throw new common_1.NotFoundException(`Usuário com ID ${updatePerformanceEvaluationDto.userId} não encontrado`);
                }
            }
            if (updatePerformanceEvaluationDto.evaluatorId) {
                const evaluator = await this.prisma.user.findUnique({ where: { id: updatePerformanceEvaluationDto.evaluatorId } });
                if (!evaluator) {
                    throw new common_1.NotFoundException(`Avaliador com ID ${updatePerformanceEvaluationDto.evaluatorId} não encontrado`);
                }
            }
            const updateData = {
                period: updatePerformanceEvaluationDto.period,
                score: updatePerformanceEvaluationDto.score,
                goals: updatePerformanceEvaluationDto.goals,
                achievements: updatePerformanceEvaluationDto.achievements,
                feedback: updatePerformanceEvaluationDto.feedback,
                status: updatePerformanceEvaluationDto.status,
            };
            if (updatePerformanceEvaluationDto.userId) {
                updateData.user_id = updatePerformanceEvaluationDto.userId;
            }
            if (updatePerformanceEvaluationDto.evaluatorId) {
                updateData.evaluator_id = updatePerformanceEvaluationDto.evaluatorId;
            }
            const evaluation = await this.prisma.performanceEvaluation.update({
                where: { id },
                data: updateData,
                include: {
                    users_performance_evaluations_user_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            position: { select: { name: true } },
                            department: { select: { name: true } },
                        },
                    },
                    users_performance_evaluations_evaluator_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            console.log('Avaliação atualizada com sucesso:', JSON.stringify(evaluation, null, 2));
            return evaluation;
        }
        catch (error) {
            console.error('Erro ao atualizar avaliação:', {
                id,
                dto: JSON.stringify(updatePerformanceEvaluationDto, null, 2),
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.findOne(id);
            const evaluation = await this.prisma.performanceEvaluation.delete({
                where: { id },
            });
            console.log('Avaliação removida com sucesso:', JSON.stringify(evaluation, null, 2));
            return evaluation;
        }
        catch (error) {
            console.error('Erro ao remover avaliação:', {
                id,
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async getEvaluationsByUser(userId, page = 1, limit = 10) {
        return this.findAll(page, limit, userId);
    }
    async getEvaluationsByEvaluator(evaluatorId, page = 1, limit = 10) {
        return this.findAll(page, limit, undefined, evaluatorId);
    }
    async getEvaluationsByPeriod(period, page = 1, limit = 10) {
        return this.findAll(page, limit, undefined, undefined, period);
    }
    async approveEvaluation(id, approverId) {
        try {
            const evaluation = await this.findOne(id);
            const approver = await this.prisma.user.findUnique({
                where: { id: approverId },
            });
            if (!approver || !['admin', 'manager'].includes(approver.role)) {
                throw new common_1.ForbiddenException('Usuário não tem permissão para aprovar avaliações');
            }
            const approvedEvaluation = await this.prisma.performanceEvaluation.update({
                where: { id },
                data: { status: 'approved' },
                include: {
                    users_performance_evaluations_user_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    users_performance_evaluations_evaluator_idTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            console.log('Avaliação aprovada com sucesso:', JSON.stringify(approvedEvaluation, null, 2));
            return approvedEvaluation;
        }
        catch (error) {
            console.error('Erro ao aprovar avaliação:', {
                id,
                approverId,
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
};
exports.PerformanceEvaluationsService = PerformanceEvaluationsService;
exports.PerformanceEvaluationsService = PerformanceEvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceEvaluationsService);
//# sourceMappingURL=performance-evaluations.service.js.map