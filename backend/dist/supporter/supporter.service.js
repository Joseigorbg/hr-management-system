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
exports.SupporterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let SupporterService = class SupporterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page, limit, search, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status && status !== 'all') {
            where.status = status;
        }
        const [supporters, total] = await Promise.all([
            this.prisma.supporter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.supporter.count({ where }),
        ]);
        return {
            data: supporters,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOne(id) {
        const supporter = await this.prisma.supporter.findUnique({ where: { id } });
        if (!supporter) {
            throw new common_1.NotFoundException(`Apoiador com ID ${id} não encontrado`);
        }
        return supporter;
    }
    async create(createSupporterDto) {
        if (!createSupporterDto.name || !createSupporterDto.phone || !createSupporterDto.address) {
            throw new common_1.BadRequestException('Nome, telefone e endereço são obrigatórios');
        }
        const data = {
            name: createSupporterDto.name,
            phone: createSupporterDto.phone,
            address: createSupporterDto.address,
            cep: createSupporterDto.cep,
            mapping: createSupporterDto.mapping,
            supportType: createSupporterDto.supportType,
            status: createSupporterDto.status || 'active',
            lat: createSupporterDto.lat,
            lng: createSupporterDto.lng,
            updatedAt: new Date(),
        };
        return this.prisma.supporter.create({
            data,
        });
    }
    async update(id, updateSupporterDto) {
        const supporter = await this.prisma.supporter.findUnique({ where: { id } });
        if (!supporter) {
            throw new common_1.NotFoundException(`Apoiador com ID ${id} não encontrado`);
        }
        if (updateSupporterDto.name === '' || updateSupporterDto.phone === '' || updateSupporterDto.address === '') {
            throw new common_1.BadRequestException('Nome, telefone e endereço não podem ser vazios');
        }
        const data = {
            name: updateSupporterDto.name ?? supporter.name,
            phone: updateSupporterDto.phone ?? supporter.phone,
            address: updateSupporterDto.address ?? supporter.address,
            cep: updateSupporterDto.cep ?? supporter.cep,
            mapping: updateSupporterDto.mapping ?? supporter.mapping,
            supportType: updateSupporterDto.supportType ?? supporter.supportType,
            status: updateSupporterDto.status ?? supporter.status,
            lat: updateSupporterDto.lat ?? supporter.lat,
            lng: updateSupporterDto.lng ?? supporter.lng,
            updatedAt: new Date(),
        };
        return this.prisma.supporter.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        const supporter = await this.prisma.supporter.findUnique({ where: { id } });
        if (!supporter) {
            throw new common_1.NotFoundException(`Apoiador com ID ${id} não encontrado`);
        }
        await this.prisma.supporter.delete({ where: { id } });
        return { success: true };
    }
};
exports.SupporterService = SupporterService;
exports.SupporterService = SupporterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupporterService);
//# sourceMappingURL=supporter.service.js.map