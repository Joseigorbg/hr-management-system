import { PrismaService } from '../common/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.findByUser(userId);
  }

  async findByUser(userId: string) {
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

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado para este usuário');
    }

    const updateData: any = {
      address: updateProfileDto.address,
      phone: updateProfileDto.phone,
      birthDate: updateProfileDto.birthDate ? new Date(updateProfileDto.birthDate) : undefined,
      document: updateProfileDto.document,
      emergencyContact: updateProfileDto.emergencyContact,
      avatar: updateProfileDto.avatar,
      bio: updateProfileDto.bio,
    };

    // Remover campos undefined para evitar erros no Prisma
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    // Atualizar o nome do usuário se fornecido
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

  async updateAvatar(userId: string, avatarFile: Express.Multer.File) {
    const profile = await this.prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado para este usuário');
    }

    if (!avatarFile) {
      throw new BadRequestException('Nenhum arquivo fornecido');
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

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
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

  async getRecentActivity(userId: string) {
    const activities = await this.prisma.$queryRaw`
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
}