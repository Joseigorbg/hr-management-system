"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const prisma_service_1 = require("../common/prisma/prisma.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const common_2 = require("@nestjs/common");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './Uploads/reports',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
                        console.log('Multer: Gerando nome de arquivo:', { originalname: file.originalname, uniqueSuffix });
                        callback(null, uniqueSuffix);
                    },
                }),
                fileFilter: (req, file, callback) => {
                    console.log('Multer: Verificando arquivo:', {
                        file: file ? {
                            originalname: file.originalname,
                            mimetype: file.mimetype,
                            size: file.size,
                            bufferLength: file.buffer?.length,
                        } : 'Arquivo ausente',
                        requestBody: req.body,
                    });
                    if (!file) {
                        console.error('Multer: Nenhum arquivo enviado');
                        return callback(new common_2.BadRequestException('Nenhum arquivo enviado'), false);
                    }
                    const allowedTypes = [
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/msword',
                        'application/vnd.ms-excel',
                        'text/plain',
                        'image/jpeg',
                        'image/png',
                    ];
                    if (!allowedTypes.includes(file.mimetype)) {
                        console.error('Multer: Tipo de arquivo não permitido:', file.mimetype);
                        return callback(new common_2.BadRequestException('Tipo de arquivo não permitido. Apenas PDF, DOCX, XLSX, DOC, XLS, TXT, JPG e PNG são suportados.'), false);
                    }
                    callback(null, true);
                },
            }),
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService, prisma_service_1.PrismaService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map