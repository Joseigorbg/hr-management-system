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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingController = void 0;
const common_1 = require("@nestjs/common");
const training_service_1 = require("./training.service");
const dto_1 = require("./dto");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../common/prisma/prisma.service");
const uuid_1 = require("uuid");
let TrainingController = class TrainingController {
    constructor(trainingService, prisma) {
        this.trainingService = trainingService;
        this.prisma = prisma;
    }
    async findAll(page = '1', limit = '10', search) {
        const trainings = await this.trainingService.findAll(parseInt(page), parseInt(limit), search);
        return { data: trainings };
    }
    async findOne(id) {
        const training = await this.trainingService.findOneDetailed(id);
        return { data: training };
    }
    async create(createTrainingDto, request, file) {
        console.log('Received raw request body:', request.body);
        console.log('Received createTrainingDto:', createTrainingDto);
        console.log('Uploaded file:', file);
        if (file) {
            const allowedMimeTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`);
            }
        }
        const userId = request.user.id;
        const training = await this.trainingService.create(createTrainingDto, file, userId);
        return { data: training, message: 'Treinamento criado com sucesso' };
    }
    async update(id, updateTrainingDto, request, file) {
        console.log('Received updateTrainingDto:', updateTrainingDto);
        console.log('Uploaded file:', file);
        if (file) {
            const allowedMimeTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`);
            }
        }
        const userId = request.user.id;
        const training = await this.trainingService.update(id, updateTrainingDto, file, userId);
        return { data: training, message: 'Treinamento atualizado com sucesso' };
    }
    async updateProgress(id, updateProgressDto) {
        const training = await this.trainingService.updateProgress(id, updateProgressDto.progress);
        return { data: training, message: 'Progresso atualizado com sucesso' };
    }
    async remove(id) {
        await this.trainingService.remove(id);
        return { message: 'Treinamento excluído com sucesso' };
    }
    async addParticipant(id, addParticipantDto, request, file) {
        const { userId, progress = 0 } = addParticipantDto;
        const training = await this.trainingService.findOneDetailed(id);
        if (!training)
            throw new common_1.NotFoundException('Treinamento não encontrado');
        if (isNaN(progress) || progress < 0 || progress > 100) {
            throw new common_1.BadRequestException('Progresso deve ser um número entre 0 e 100');
        }
        const userTraining = await this.prisma.userTraining.create({
            data: {
                id: (0, uuid_1.v4)(),
                user_id: userId,
                training_id: id,
                enrolledAt: new Date(),
                status: 'enrolled',
                progress: progress,
            },
        });
        if (file) {
            const allowedMimeTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`);
            }
            await this.prisma.trainingDocument.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    userTrainingId: userTraining.id,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath: `/uploads/participants/${file.originalname}`,
                    uploadedAt: new Date(),
                    uploadedBy: request.user.id,
                },
            });
        }
        return { data: userTraining, message: 'Participante adicionado com sucesso' };
    }
    async updateParticipantProgress(trainingId, userId, updateProgressDto) {
        console.log('Received updateProgressDto:', updateProgressDto);
        const training = await this.trainingService.findOneDetailed(trainingId);
        if (!training)
            throw new common_1.NotFoundException('Treinamento não encontrado');
        const userTraining = await this.prisma.userTraining.findFirst({
            where: {
                training_id: trainingId,
                user_id: userId,
            },
        });
        if (!userTraining)
            throw new common_1.NotFoundException('Participante não encontrado no treinamento');
        const updatedUserTraining = await this.prisma.userTraining.update({
            where: { id: userTraining.id },
            data: { progress: updateProgressDto.progress },
        });
        return { data: updatedUserTraining, message: 'Progresso do participante atualizado com sucesso' };
    }
    async uploadParticipantDocument(trainingId, userId, request, file) {
        const training = await this.trainingService.findOneDetailed(trainingId);
        if (!training)
            throw new common_1.NotFoundException('Treinamento não encontrado');
        const userTraining = await this.prisma.userTraining.findFirst({
            where: { training_id: trainingId, user_id: userId },
        });
        if (!userTraining)
            throw new common_1.NotFoundException('Participante não encontrado no treinamento');
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Validation failed (current file type is ${file.mimetype}, expected type is one of ${allowedMimeTypes.join(', ')})`);
        }
        const document = await this.prisma.trainingDocument.create({
            data: {
                id: (0, uuid_1.v4)(),
                userTrainingId: userTraining.id,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                filePath: `/uploads/participants/${file.originalname}`,
                uploadedAt: new Date(),
                uploadedBy: request.user.id,
            },
        });
        return { data: document, message: 'Documento enviado com sucesso' };
    }
};
exports.TrainingController = TrainingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        exceptionFactory: (error) => {
            console.error('File validation error:', error);
            return new common_1.BadRequestException(`File validation failed: ${error}`);
        },
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTrainingDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        exceptionFactory: (error) => {
            console.error('File validation error:', error);
            return new common_1.BadRequestException(`File validation failed: ${error}`);
        },
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTrainingDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateProgressDto]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/participants'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        exceptionFactory: (error) => {
            console.error('File validation error:', error);
            return new common_1.BadRequestException(`File validation failed: ${error}`);
        },
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddParticipantDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "addParticipant", null);
__decorate([
    (0, common_1.Patch)(':id/participants/:userId/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateProgressDto]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "updateParticipantProgress", null);
__decorate([
    (0, common_1.Post)(':id/participants/:userId/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        exceptionFactory: (error) => {
            console.error('File validation error:', error);
            return new common_1.BadRequestException(`File validation failed: ${error}`);
        },
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "uploadParticipantDocument", null);
exports.TrainingController = TrainingController = __decorate([
    (0, common_1.Controller)('trainings'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [training_service_1.TrainingService,
        prisma_service_1.PrismaService])
], TrainingController);
//# sourceMappingURL=training.controller.js.map