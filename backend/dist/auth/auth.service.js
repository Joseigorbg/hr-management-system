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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const mailer_1 = require("@nestjs-modules/mailer");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailerService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
    }
    async validateUser(email, password) {
        console.log('Buscando usuário com email:', email);
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                position: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
            },
        });
        console.log('Usuário encontrado:', user);
        if (!user) {
            console.log('Usuário não encontrado');
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('Senha válida?', isPasswordValid);
        if (!isPasswordValid) {
            console.log('Senha inválida');
            return null;
        }
        const { password_hash, ...result } = user;
        return result;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        console.log('Tentando login com:', { email });
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = { id: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
    async register(registerDto) {
        const { email, password, name, role, positionId, departmentId } = registerDto;
        console.log('Registrando usuário com:', { email, name, role });
        if (departmentId) {
            const department = await this.prisma.department.findUnique({
                where: { id: departmentId },
            });
            if (!department) {
                throw new common_1.BadRequestException('Departamento inválido');
            }
        }
        if (positionId) {
            const position = await this.prisma.position.findUnique({
                where: { id: positionId },
            });
            if (!position) {
                throw new common_1.BadRequestException('Posição inválida');
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                id: (0, uuid_1.v4)(),
                email,
                password_hash: hashedPassword,
                name,
                role,
                positionId,
                departmentId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const payload = { id: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
    async getProfile(userId) {
        console.log('Buscando perfil do usuário com ID:', userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        return user;
    }
    async refreshToken(userId) {
        console.log('Renovando token para usuário com ID:', userId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        const payload = { id: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async forgotPassword(email) {
        console.log('Solicitando redefinição de senha para email:', email);
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('Usuário não encontrado para redefinição');
            throw new common_1.BadRequestException('Usuário não encontrado');
        }
        const resetToken = this.jwtService.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        await this.mailerService.sendMail({
            to: email,
            from: 'no-reply@yourdomain.com',
            subject: 'Redefinição de Senha',
            html: `<p>Clique <a href="${resetLink}">aqui</a> para redefinir sua senha.</p>`,
        });
        console.log('Link de redefinição enviado para:', email);
        return { message: 'Um link de redefinição de senha foi enviado para seu email.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mailer_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map