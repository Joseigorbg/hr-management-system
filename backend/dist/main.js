"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("@nestjs/config");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const path_1 = require("path");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const Sentry = __importStar(require("@sentry/node"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const fs = __importStar(require("fs/promises"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = nest_winston_1.WinstonModule.createLogger({
        transports: [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
            new winston.transports.Console(),
        ],
    });
    app.useLogger(logger);
    Sentry.init({
        dsn: configService.get('SENTRY_DSN'),
        environment: configService.get('NODE_ENV') || 'development',
    });
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: configService.get('NODE_ENV') === 'development' ? 1000 : 100,
        message: 'Muitas requisições a partir deste IP, tente novamente após 15 minutos',
    }));
    const uploadBaseDir = (0, path_1.join)(__dirname, '..', 'Uploads');
    try {
        await fs.mkdir(uploadBaseDir, { recursive: true });
        const subDirs = ['documents', 'profile', 'reports'];
        for (const dir of subDirs) {
            const uploadDir = (0, path_1.join)(uploadBaseDir, dir);
            await fs.mkdir(uploadDir, { recursive: true });
            console.log(`Diretório ${uploadDir} criado ou já existe`);
        }
    }
    catch (error) {
        logger.error('Erro ao criar diretórios de upload:', error);
        throw new Error('Erro ao configurar diretórios de upload');
    }
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'Uploads'), {
        prefix: '/Uploads',
        setHeaders: (res) => {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        },
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'http://localhost:3000', 'data:', configService.get('APP_URL') || 'http://localhost:3000'],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", 'http://localhost:5173', configService.get('CORS_ORIGIN') || 'http://localhost:5173'],
                frameSrc: ["'self'", 'blob:', 'http://localhost:3000', configService.get('APP_URL') || 'http://localhost:3000'],
            },
        },
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, Content-Disposition, Accept',
    });
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        disableErrorMessages: false,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('HR Management System API')
        .setDescription('Sistema de Gestão de Pessoas - API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('PORT') || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map