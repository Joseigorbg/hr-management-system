import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: Number(this.configService.get('EMAIL_PORT')),
      secure: true,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendCustomEmail(to: string, subject: string, message: string, companyName: string) {
    try {
      const templatePath = join(__dirname, '..', 'templates', 'email-template.hbs');
      const templateSource = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      const html = template({
        logoUrl: `${this.configService.get('APP_URL')}/assets/logo.png`,
        subject,
        message,
        companyName,
      });

      await this.transporter.sendMail({
        from: `"${companyName}" <${this.configService.get('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new Error(`Erro ao enviar e-mail: ${error.message}`);
    }
  }
}