import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { SettingsService } from './settings.service';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class BackupScheduler implements OnModuleInit {
  private s3Client: S3Client;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-2',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  onModuleInit() {
    // Agendar backup diário às 2h da manhã
    cron.schedule('0 2 * * *', async () => {
      console.log('Executando backup automático...');
      try {
        const backupResult = await this.settingsService.backup();
        const emailEnabled = await this.settingsService.findByKey('notification.email_enabled');
        if (emailEnabled?.value === 'true') {
          await this.emailService.sendCustomEmail(
            'admin@seusistema.com',
            'Backup Concluído',
            `Backup de configurações realizado com sucesso em ${new Date().toLocaleString()}. Path: ${backupResult.path}`,
            this.configService.get<string>('COMPANY_NAME') || 'HR Management System',
          );
        }
      } catch (error) {
        console.error('Erro no backup automático:', error);
      }
    });
  }
}
