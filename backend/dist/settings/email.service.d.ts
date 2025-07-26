import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendCustomEmail(to: string, subject: string, message: string, companyName: string): Promise<void>;
}
