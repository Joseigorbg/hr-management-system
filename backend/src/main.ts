import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Sentry from '@sentry/node';
import rateLimit from 'express-rate-limit';
import * as fs from 'fs/promises';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Configurar Winston para logging
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
      new winston.transports.Console(),
    ],
  });
  app.useLogger(logger);

  // Configurar Sentry
  Sentry.init({
    dsn: configService.get('SENTRY_DSN'),
    environment: configService.get('NODE_ENV') || 'development',
  });

  // Configurar rate limiting com express-rate-limit
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: configService.get('NODE_ENV') === 'development' ? 1000 : 100, // 1000 em dev, 100 em prod
      message: 'Muitas requisições a partir deste IP, tente novamente após 15 minutos',
    }),
  );

  // Criar diretórios de uploads, se não existirem
  const uploadBaseDir = join(__dirname, '..', 'Uploads');
  try {
    await fs.mkdir(uploadBaseDir, { recursive: true });
    const subDirs = ['documents', 'profile', 'reports'];
    for (const dir of subDirs) {
      const uploadDir = join(uploadBaseDir, dir);
      await fs.mkdir(uploadDir, { recursive: true });
      console.log(`Diretório ${uploadDir} criado ou já existe`);
    }
  } catch (error) {
    logger.error('Erro ao criar diretórios de upload:', error);
    throw new Error('Erro ao configurar diretórios de upload');
  }

  // Serve static files from uploads directory with dynamic Content-Type
  app.useStaticAssets(join(__dirname, '..', 'Uploads'), {
    prefix: '/Uploads',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    },
  });

  // Configurar helmet com CSP personalizada
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'http://localhost:3000', 'data:', configService.get('APP_URL') || 'http://localhost:3000'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'http://localhost:5173', configService.get('CORS_ORIGIN') || 'http://localhost:5173'],
          frameSrc: ["'self'", 'blob:', 'http://localhost:3000', configService.get('APP_URL') || 'http://localhost:3000'],
        },
      },
    }),
  );

  app.use(compression());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Content-Disposition, Accept',
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transforma automaticamente o corpo da requisição para o tipo do DTO
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: false, // Não rejeita propriedades esperadas
      disableErrorMessages: false, // Mostra mensagens de erro detalhadas
      transformOptions: { enableImplicitConversion: true }, // Permite conversão implícita de tipos
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HR Management System API')
    .setDescription('Sistema de Gestão de Pessoas - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();