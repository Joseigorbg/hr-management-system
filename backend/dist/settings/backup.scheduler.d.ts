import { OnModuleInit } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
export declare class BackupScheduler implements OnModuleInit {
    private readonly settingsService;
    private readonly emailService;
    private readonly configService;
    private s3Client;
    constructor(settingsService: SettingsService, emailService: EmailService, configService: ConfigService);
    onModuleInit(): void;
}
