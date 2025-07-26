import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PositionsModule } from './positions/positions.module';
import { DepartmentsModule } from './departments/departments.module';
import { PerformanceEvaluationsModule } from './performance-evaluations/performance-evaluations.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { TasksModule } from './tasks/tasks.module';
import { GroupsModule } from './groups/groups.module'; // Adicionado
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { ProfileModule } from './profile/profile.module';
import { ChatModule } from './chat/chat.module';
import { TrainingModule } from './training/training.module';
import { SupporterModule } from './supporter/supporter.module';
import { AppController } from './app.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: parseInt(configService.get<string>('SMTP_PORT'), 10),
          secure: false,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('SMTP_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PositionsModule,
    DepartmentsModule,
    PerformanceEvaluationsModule,
    AdmissionsModule,
    TasksModule,
    GroupsModule, // Adicionado
    ReportsModule,
    SettingsModule,
    ProfileModule,
    ChatModule,
    TrainingModule,
    SupporterModule,
  ],
  controllers: [AppController],
})
export class AppModule {}