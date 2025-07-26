import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    console.log('Tentando login com:', { email });
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, positionId, departmentId } = registerDto;
    console.log('Registrando usuário com:', { email, name, role });

    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        throw new BadRequestException('Departamento inválido');
      }
    }

    if (positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });
      if (!position) {
        throw new BadRequestException('Posição inválida');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        id: uuidv4(),
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

  async getProfile(userId: string) {
    console.log('Buscando perfil do usuário com ID:', userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  async refreshToken(userId: string) {
    console.log('Renovando token para usuário com ID:', userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    console.log('Solicitando redefinição de senha para email:', email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('Usuário não encontrado para redefinição');
      throw new BadRequestException('Usuário não encontrado');
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
}