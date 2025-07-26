"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ConfigService = class ConfigService {
    constructor(prisma) {
        this.prisma = prisma;
        this.settings = new Map();
        this.loadSettings();
    }
    async loadSettings() {
        try {
            const settings = await this.prisma.setting.findMany();
            this.settings.clear();
            settings.forEach((setting) => {
                this.settings.set(setting.key.toLowerCase(), setting.value);
            });
        }
        catch (error) {
            throw new Error(`Erro ao carregar configurações: ${error.message}`);
        }
    }
    get(key, defaultValue) {
        return this.settings.get(key.toLowerCase()) ?? defaultValue;
    }
    async set(key, value, description, category) {
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
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Configuração com esta chave já existe');
            }
            throw new Error(`Erro ao definir configuração: ${error.message}`);
        }
    }
    getAll() {
        return Object.fromEntries(this.settings);
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigService);
//# sourceMappingURL=config.service.js.map