import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ConfigService {
  private settings: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const settings = await this.prisma.setting.findMany();
      this.settings.clear();
      settings.forEach((setting) => {
        this.settings.set(setting.key.toLowerCase(), setting.value);
      });
    } catch (error) {
      throw new Error(`Erro ao carregar configurações: ${error.message}`);
    }
  }

  get(key: string, defaultValue?: string): string | undefined {
    return this.settings.get(key.toLowerCase()) ?? defaultValue;
  }

  async set(key: string, value: string, description?: string, category?: string) {
    try {
      const normalizedKey = key.toLowerCase();
      const setting = await this.prisma.setting.upsert({
        where: { key: normalizedKey },
        update: { value, description, category, updatedAt: new Date() },
        create: { 
          key: normalizedKey, 
          value, 
          description, 
          category, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      });
      this.settings.set(normalizedKey, value);
      return setting;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Configuração com esta chave já existe');
      }
      throw new Error(`Erro ao definir configuração: ${error.message}`);
    }
  }

  getAll() {
    return Object.fromEntries(this.settings);
  }
}