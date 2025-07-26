"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingModule = void 0;
const common_1 = require("@nestjs/common");
const training_service_1 = require("./training.service");
const training_controller_1 = require("./training.controller");
const prisma_service_1 = require("../common/prisma/prisma.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let TrainingModule = class TrainingModule {
};
exports.TrainingModule = TrainingModule;
exports.TrainingModule = TrainingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                useFactory: () => ({
                    storage: (0, multer_1.diskStorage)({
                        destination: (req, file, cb) => {
                            const isParticipantDocument = req.route?.path.includes('/participants');
                            const basePath = (0, path_1.join)(__dirname, '..', '..', 'uploads');
                            const destinationPath = isParticipantDocument
                                ? (0, path_1.join)(basePath, 'participants')
                                : (0, path_1.join)(basePath, 'training_documents');
                            cb(null, destinationPath);
                        },
                        filename: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                            cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
                        },
                    }),
                }),
            }),
        ],
        controllers: [training_controller_1.TrainingController],
        providers: [training_service_1.TrainingService, prisma_service_1.PrismaService],
    })
], TrainingModule);
//# sourceMappingURL=training.module.js.map