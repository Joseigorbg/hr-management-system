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
exports.TrainingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const crypto_1 = require("crypto");
let TrainingService = class TrainingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { instructor: { name: { contains: search, mode: 'insensitive' } } },
                ],
            }
            : {};
        const trainings = await this.prisma.training.findMany({
            where,
            skip,
            take: limit,
            include: {
                instructor: true,
                training_participations: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return trainings.map(training => ({
            ...training,
            participantCount: training.training_participations.length,
        }));
    }
    async findOneDetailed(id) {
        const training = await this.prisma.training.findUnique({
            where: { id },
            include: {
                instructor: true,
                training_participations: {
                    include: {
                        users: true,
                        documents: true,
                    },
                },
                tasks: true,
            },
        });
        if (!training) {
            throw new common_1.NotFoundException('Treinamento não encontrado');
        }
        return {
            ...training,
            participants: training.training_participations.map((pt) => ({
                user: pt.users,
                documents: pt.documents,
                progress: pt.progress,
                status: pt.status,
            })),
            taskCount: training.tasks.length,
            completedTasks: training.tasks.filter((t) => !t.isActive).length,
        };
    }
    async create(createTrainingDto, file, userId) {
        const { name, description, startDate, endDate, maxParticipants, status, progress, instructorId } = createTrainingDto;
        if (!name || !startDate || !endDate) {
            throw new common_1.BadRequestException('Nome, data de início e data de término são obrigatórios');
        }
        if (progress !== null && (isNaN(progress) || progress < 0 || progress > 100)) {
            throw new common_1.BadRequestException('Progresso deve ser um número entre 0 e 100 ou null');
        }
        return this.prisma.$transaction(async (prisma) => {
            const training = await prisma.training.create({
                data: {
                    name,
                    description: description || null,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    maxParticipants: maxParticipants ?? null,
                    status: status || 'scheduled',
                    progress: progress ?? null,
                    instructorId: instructorId || null,
                },
                include: { instructor: true },
            });
            if (file && userId) {
                const userTraining = await prisma.userTraining.findFirst({
                    where: { user_id: userId, training_id: training.id },
                });
                if (!userTraining) {
                    await prisma.userTraining.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            user_id: userId,
                            training_id: training.id,
                            enrolledAt: new Date(),
                            status: 'enrolled',
                        },
                    });
                }
                const existingUserTraining = await prisma.userTraining.findFirst({
                    where: { user_id: userId, training_id: training.id },
                });
                await prisma.trainingDocument.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        userTrainingId: existingUserTraining.id,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath: file.path,
                        uploadedAt: new Date(),
                        uploadedBy: userId,
                    },
                });
            }
            return training;
        });
    }
    async update(id, updateTrainingDto, file, userId) {
        const existingTraining = await this.prisma.training.findUnique({ where: { id } });
        if (!existingTraining) {
            throw new common_1.NotFoundException('Treinamento não encontrado');
        }
        const { name, description, startDate, endDate, maxParticipants, status, progress, instructorId } = updateTrainingDto;
        if (progress !== undefined && progress !== null && (isNaN(progress) || progress < 0 || progress > 100)) {
            throw new common_1.BadRequestException('Progresso deve ser um número entre 0 e 100 ou null');
        }
        return this.prisma.$transaction(async (prisma) => {
            const training = await prisma.training.update({
                where: { id },
                data: {
                    name: name ?? existingTraining.name,
                    description: description ?? existingTraining.description,
                    startDate: startDate ? new Date(startDate) : existingTraining.startDate,
                    endDate: endDate ? new Date(endDate) : existingTraining.endDate,
                    maxParticipants: maxParticipants ?? existingTraining.maxParticipants,
                    status: status ?? existingTraining.status,
                    progress: progress ?? existingTraining.progress,
                    instructorId: instructorId !== undefined ? (instructorId || null) : existingTraining.instructorId,
                },
                include: { instructor: true },
            });
            if (file && userId) {
                const userTraining = await prisma.userTraining.findFirst({
                    where: { user_id: userId, training_id: training.id },
                });
                if (!userTraining) {
                    await prisma.userTraining.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            user_id: userId,
                            training_id: training.id,
                            enrolledAt: new Date(),
                            status: 'enrolled',
                        },
                    });
                }
                const existingUserTraining = await prisma.userTraining.findFirst({
                    where: { user_id: userId, training_id: training.id },
                });
                await prisma.trainingDocument.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        userTrainingId: existingUserTraining.id,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        filePath: file.path,
                        uploadedAt: new Date(),
                        uploadedBy: userId,
                    },
                });
            }
            return training;
        });
    }
    async updateProgress(id, progress) {
        if (isNaN(progress) || progress < 0 || progress > 100) {
            throw new common_1.BadRequestException('Progresso deve estar entre 0 e 100');
        }
        const training = await this.prisma.training.update({
            where: { id },
            data: { progress },
            include: { instructor: true },
        });
        if (!training) {
            throw new common_1.NotFoundException('Treinamento não encontrado');
        }
        return training;
    }
    async remove(id) {
        const training = await this.prisma.training.findUnique({ where: { id } });
        if (!training) {
            throw new common_1.NotFoundException('Treinamento não encontrado');
        }
        await this.prisma.training.delete({ where: { id } });
    }
};
exports.TrainingService = TrainingService;
exports.TrainingService = TrainingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingService);
//# sourceMappingURL=training.service.js.map