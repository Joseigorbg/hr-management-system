"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionsModule = void 0;
const common_1 = require("@nestjs/common");
const admissions_service_1 = require("./admissions.service");
const admissions_controller_1 = require("./admissions.controller");
const prisma_service_1 = require("../common/prisma/prisma.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
let AdmissionsModule = class AdmissionsModule {
};
exports.AdmissionsModule = AdmissionsModule;
exports.AdmissionsModule = AdmissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads/documents',
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    if (allowedTypes.includes(file.mimetype)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('Apenas arquivos PDF, JPEG e PNG são permitidos'), false);
                    }
                },
                limits: {
                    fileSize: 5 * 1024 * 1024,
                },
            }),
        ],
        controllers: [admissions_controller_1.AdmissionsController],
        providers: [admissions_service_1.AdmissionsService, prisma_service_1.PrismaService],
    })
], AdmissionsModule);
//# sourceMappingURL=admissions.module.js.map