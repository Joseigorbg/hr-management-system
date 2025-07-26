"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const prisma_service_1 = require("../common/prisma/prisma.service");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let ProfileService = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        return this.findByUser(userId);
    }
    async findByUser(userId) {
        let profile = await this.prisma.profile.findUnique({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        surname: true,
                        isActive: true,
                        last_login: true,
                        createdAt: true,
                        updatedAt: true,
                        position: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                salary: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                        admissions: {
                            select: {
                                hireDate: true,
                                contractType: true,
                                salary: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!profile) {
            profile = await this.prisma.profile.create({
                data: {
                    id: crypto.randomUUID(),
                    user_id: userId,
                    address: '',
                    phone: '',
                    birthDate: null,
                    document: '',
                    emergencyContact: '',
                    avatar: '',
                    bio: '',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            surname: true,
                            isActive: true,
                            last_login: true,
                            createdAt: true,
                            updatedAt: true,
                            position: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    salary: true,
                                },
                            },
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                },
                            },
                            admissions: {
                                select: {
                                    hireDate: true,
                                    contractType: true,
                                    salary: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });
            console.log(`Perfil criado para user_id: ${userId}`);
        }
        console.log('Perfil retornado:', JSON.stringify(profile, null, 2));
        return profile;
    }
    async updateProfile(userId, updateProfileDto) {
        const profile = await this.prisma.profile.findUnique({
            where: { user_id: userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Perfil não encontrado para este usuário');
        }
        const updateData = {
            address: updateProfileDto.address,
            phone: updateProfileDto.phone,
            birthDate: updateProfileDto.birthDate ? new Date(updateProfileDto.birthDate) : undefined,
            document: updateProfileDto.document,
            emergencyContact: updateProfileDto.emergencyContact,
            avatar: updateProfileDto.avatar,
            bio: updateProfileDto.bio,
        };
        Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);
        if (updateProfileDto.name) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { name: updateProfileDto.name },
            });
        }
        const updatedProfile = await this.prisma.profile.update({
            where: { user_id: userId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        surname: true,
                        position: { select: { name: true } },
                        department: { select: { name: true } },
                    },
                },
            },
        });
        console.log('Perfil atualizado:', JSON.stringify(updatedProfile, null, 2));
        return updatedProfile;
    }
    async updateAvatar(userId, avatarFile) {
        const profile = await this.prisma.profile.findUnique({
            where: { user_id: userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Perfil não encontrado para este usuário');
        }
        if (!avatarFile) {
            throw new common_1.BadRequestException('Nenhum arquivo fornecido');
        }
        const avatarUrl = `/Uploads/profile/${avatarFile.filename}`;
        console.log(`Atualizando avatar para user_id: ${userId}, URL: ${avatarUrl}`);
        const updatedProfile = await this.prisma.profile.update({
            where: { user_id: userId },
            data: { avatar: avatarUrl },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        surname: true,
                    },
                },
            },
        });
        console.log('Avatar atualizado:', JSON.stringify(updatedProfile, null, 2));
        return updatedProfile;
    }
    async updatePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { password_hash: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Senha atual incorreta');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword },
            select: { id: true, name: true, email: true },
        });
        console.log('Senha atualizada para user_id:', userId);
        return updatedUser;
    }
    async getRecentActivity(userId) {
        const activities = await this.prisma.$queryRaw `
      SELECT 
        'Login realizado' AS description, 
        last_login AS timestamp 
      FROM "users" 
      WHERE id = ${userId} AND last_login IS NOT NULL
      UNION
      SELECT 
        'Perfil atualizado' AS description, 
        updated_at AS timestamp 
      FROM "profiles" 
      WHERE user_id = ${userId}
      UNION
      SELECT 
        'Senha alterada' AS description, 
        updated_at AS timestamp 
      FROM "users" 
      WHERE id = ${userId} AND updated_at > last_login
      ORDER BY timestamp DESC 
      LIMIT 5
    `;
        console.log('Atividades recentes:', JSON.stringify(activities, null, 2));
        return activities;
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map