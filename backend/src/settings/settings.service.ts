import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from './config.service'; // Importação corrigida

@Injectable()
export class SettingsService {
  private s3: S3;

  constructor(
    private prisma: PrismaService,
    private nestConfigService: NestConfigService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3({
      region: this.nestConfigService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.nestConfigService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.nestConfigService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async create(createSettingDto: CreateSettingDto) {
    try {
      const normalizedKey = createSettingDto.key.toLowerCase();
      const existingSetting = await this.prisma.setting.findUnique({
        where: { key: normalizedKey },
      });

      if (existingSetting) {
        throw new ConflictException('Configuração com esta chave já existe');
      }

      const setting = await this.prisma.setting.create({
        data: {
          ...createSettingDto,
          key: normalizedKey,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await this.configService.set(normalizedKey, setting.value, setting.description, setting.category);
      return setting;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Configuração com esta chave já existe');
      }
      throw new Error(`Erro ao criar configuração: ${error.message}`);
    }
  }

  async findAll(page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (category) where.category = category;

    try {
      const [settings, total] = await Promise.all([
        this.prisma.setting.findMany({
          where,
          skip,
          take: limit,
          orderBy: { key: 'asc' },
        }),
        this.prisma.setting.count({ where }),
      ]);

      return {
        data: settings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Erro ao listar configurações: ${error.message}`);
    }
  }

  async backup() {
    try {
      const settings = await this.prisma.setting.findMany();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `settings_backup_${timestamp}.json`;
      const backupContent = JSON.stringify({ timestamp, settings }, null, 2);

      await this.s3.putObject({
        Bucket: this.nestConfigService.get('AWS_S3_BUCKET'),
        Key: `backups/${backupFile}`,
        Body: backupContent,
        ContentType: 'application/json',
      });

      console.log('Backup file uploaded to S3 successfully');
      return { message: 'Backup criado com sucesso', path: `s3://${this.nestConfigService.get('AWS_S3_BUCKET')}/backups/${backupFile}` };
    } catch (error) {
      console.error('Backup error details:', error);
      throw new Error(`Erro ao criar backup: ${error.message}`);
    }
  }

  async restore(data: any) {
    try {
      const settings = data.settings || [];
      const results = await this.bulkUpdate(settings);
      await this.configService.loadSettings();
      return { message: 'Backup restaurado com sucesso', results };
    } catch (error) {
      throw new Error(`Erro ao restaurar backup: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const setting = await this.prisma.setting.findUnique({
        where: { id },
      });

      if (!setting) {
        throw new NotFoundException('Configuração não encontrada');
      }

      return setting;
    } catch (error) {
      throw new Error(`Erro ao buscar configuração por ID: ${error.message}`);
    }
  }

  async findByKey(key: string) {
    try {
      const setting = await this.prisma.setting.findUnique({
        where: { key: key.toLowerCase() },
      });

      if (!setting) {
        throw new NotFoundException('Configuração não encontrada');
      }

      return setting;
    } catch (error) {
      throw new Error(`Erro ao buscar configuração por chave: ${error.message}`);
    }
  }

  async update(id: string, updateSettingDto: UpdateSettingDto) {
    try {
      await this.findOne(id);

      if (updateSettingDto.key) {
        const normalizedKey = updateSettingDto.key.toLowerCase();
        const existingSetting = await this.prisma.setting.findFirst({
          where: {
            key: normalizedKey,
            id: { not: id },
          },
        });

        if (existingSetting) {
          throw new ConflictException('Configuração com esta chave já existe');
        }
      }

      const setting = await this.prisma.setting.update({
        where: { id },
        data: {
          ...updateSettingDto,
          key: updateSettingDto.key ? updateSettingDto.key.toLowerCase() : undefined,
          updatedAt: new Date(),
        },
      });

      if (updateSettingDto.key || updateSettingDto.value) {
        await this.configService.set(setting.key, setting.value, setting.description, setting.category);
      }

      return setting;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Configuração com esta chave já existe');
      }
      throw new Error(`Erro ao atualizar configuração: ${error.message}`);
    }
  }

  async updateByKey(key: string, value: string, description?: string, category?: string) {
    try {
      const normalizedKey = key.toLowerCase();
      const setting = await this.prisma.setting.upsert({
        where: { key: normalizedKey },
        update: { 
          value, 
          description, 
          category, 
          updatedAt: new Date() 
        },
        create: {
          key: normalizedKey,
          value,
          description: description || `Configuração para ${normalizedKey}`,
          category: category || normalizedKey.split('.')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await this.configService.set(normalizedKey, value, description, category);
      return setting;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Configuração com esta chave já existe');
      }
      throw new Error(`Erro ao atualizar configuração por chave: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const setting = await this.findOne(id);
      const deleted = await this.prisma.setting.delete({
        where: { id },
      });
      await this.configService.loadSettings();
      return deleted;
    } catch (error) {
      throw new Error(`Erro ao remover configuração: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const categories = await this.prisma.setting.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { category: { not: null } },
      });

      return categories.map(c => c.category).filter(Boolean);
    } catch (error) {
      throw new Error(`Erro ao listar categorias: ${error.message}`);
    }
  }

  async getSettingsByCategory(category: string) {
    try {
      return await this.prisma.setting.findMany({
        where: { category },
        orderBy: { key: 'asc' },
      });
    } catch (error) {
      throw new Error(`Erro ao buscar configurações por categoria: ${error.message}`);
    }
  }

  async bulkUpdate(settings: { key: string; value: string; description?: string; category?: string }[]) {
    const results = [];

    for (const setting of settings) {
      try {
        const updated = await this.updateByKey(
          setting.key,
          setting.value,
          setting.description,
          setting.category
        );
        results.push({ success: true, key: setting.key, data: updated });
      } catch (error) {
        results.push({
          success: false,
          key: setting.key,
          error: error.message,
        });
      }
    }

    return results;
  }

  async getSystemSettings() {
    return this.getSettingsByCategory('system');
  }

  async getNotificationSettings() {
    return this.getSettingsByCategory('notification');
  }

  async getSecuritySettings() {
    return this.getSettingsByCategory('security');
  }

  async initializeDefaultSettings() {
    const defaultSettings = [
      {
        key: 'system.company_name',
        value: 'Minha Empresa',
        description: 'Nome da empresa',
        category: 'system',
      },
      {
        key: 'system.timezone',
        value: 'America/Sao_Paulo',
        description: 'Fuso horário do sistema',
        category: 'system',
      },
      {
        key: 'system.language',
        value: 'pt-BR',
        description: 'Idioma padrão do sistema',
        category: 'system',
      },
      {
        key: 'notification.email_enabled',
        value: 'true',
        description: 'Habilitar notificações por email',
        category: 'notification',
      },
      {
        key: 'notification.sms_enabled',
        value: 'false',
        description: 'Habilitar notificações por SMS',
        category: 'notification',
      },
      {
        key: 'security.password_min_length',
        value: '8',
        description: 'Tamanho mínimo da senha',
        category: 'security',
      },
      {
        key: 'security.session_timeout',
        value: '3600',
        description: 'Timeout da sessão em segundos',
        category: 'security',
      },
      {
        key: 'security.max_login_attempts',
        value: '5',
        description: 'Máximo de tentativas de login',
        category: 'security',
      },
    ];

    const results = [];

    for (const setting of defaultSettings) {
      try {
        const normalizedKey = setting.key.toLowerCase();
        const existing = await this.prisma.setting.findUnique({
          where: { key: normalizedKey },
        });

        if (!existing) {
          const created = await this.prisma.setting.create({
            data: {
              ...setting,
              key: normalizedKey,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          await this.configService.set(created.key, created.value, created.description, created.category);
          results.push({ created: true, key: setting.key, data: created });
        } else {
          results.push({ created: false, key: setting.key, message: 'Já existe' });
        }
      } catch (error) {
        results.push({
          created: false,
          key: setting.key,
          error: error.message,
        });
      }
    }

    return results;
  }
}