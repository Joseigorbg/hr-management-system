import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { ConfigService } from './config.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { EmailService } from './email.service';
import { BackupScheduler } from './backup.scheduler';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SettingsController],
  providers: [SettingsService, ConfigService, EmailService, BackupScheduler],
  exports: [SettingsService, ConfigService],
})
export class SettingsModule {}