import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto'; // Novo import
import * as bcrypt from 'bcryptjs';
import { UserWithPassword } from '../types/user.types';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async withRetry<T>(operation: () => Promise<T>, maxAttempts = 3, initialDelayMs = 1000): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts || !error.message.includes('Can\'t reach database server')) {
          throw error;
        }
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Retrying operation (attempt ${attempt}/${maxAttempts}) due to database connection issue...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Max retry attempts reached');
  }

  async create(createUserDto: CreateUserDto, files?: Express.Multer.File[]) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password || `temp_${Date.now()}`, 10);

    const salaryValue = createUserDto.salary !== undefined
      ? typeof createUserDto.salary === 'string'
        ? parseFloat(createUserDto.salary)
        : createUserDto.salary
      : 0.0;

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        surname: createUserDto.surname,
        password_hash: hashedPassword,
        role: createUserDto.role || 'employee',
        positionId: createUserDto.positionId,
        departmentId: createUserDto.departmentId,
        profile: {
          create: {
            address: '',
            phone: '',
            avatar: '/uploads/profile/default-avatar.png', // Avatar padrão
          },
        },
        admissions: {
          create: {
            hireDate: createUserDto.hireDate ? new Date(createUserDto.hireDate) : new Date(),
            contractType: createUserDto.contractType || 'CLT',
            salary: salaryValue,
            status: createUserDto.status || 'active',
            benefits: createUserDto.benefits || '{}',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        positionId: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        admissions: {
          select: {
            id: true,
            hireDate: true,
            contractType: true,
            salary: true,
            status: true,
            benefits: true,
            documents: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                filePath: true,
                uploadedAt: true,
              },
            },
          },
        },
      },
    });

    if (files && files.length > 0) {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`).replace(/\\/g, '/');
        await fs.writeFile(filePath, file.buffer);
        await this.prisma.admissionDocument.create({
          data: {
            admissionId: user.admissions.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: filePath.replace(new RegExp(`^${path.resolve(uploadDir)}`, 'i'), '/uploads/documents'),
            uploadedAt: new Date(),
          },
        });
      }
    }

    return user;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        where.OR = [
          { admissions: { status: { equals: 'active' } } },
          { admissions: { is: null } },
        ];
      } else {
        where.admissions = { status: { equals: status } };
      }
    } else {
      where.OR = [
        { admissions: { status: { equals: 'active' } } },
        { admissions: { is: null } },
      ];
    }

    const [users, total] = await this.withRetry(() =>
      Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            profile: true,
            admissions: {
              select: {
                id: true,
                hireDate: true,
                contractType: true,
                salary: true,
                status: true,
                benefits: true,
                documents: {
                  select: {
                    id: true,
                    fileName: true,
                    fileType: true,
                    fileSize: true,
                    filePath: true,
                    uploadedAt: true,
                  },
                },
              },
            },
            department: true,
            position: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ])
    );

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findUsers(name?: string, email?: string, status?: 'active' | 'vacation' | 'inactive' | 'terminated') {
    const where: any = { isActive: true };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (status) where.admissions = { status: { equals: status } };

    return this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        admissions: {
          select: { id: true, status: true },
        },
        department: true,
        position: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.withRetry(() =>
      this.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          admissions: {
            select: {
              id: true,
              hireDate: true,
              contractType: true,
              salary: true,
              status: true,
              benefits: true,
              documents: {
                select: {
                  id: true,
                  fileName: true,
                  fileType: true,
                  fileSize: true,
                  filePath: true,
                  uploadedAt: true,
                },
              },
            },
          },
          department: true,
          position: true,
        },
      })
    );

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        admissions: {
          include: {
            documents: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                filePath: true,
                uploadedAt: true,
              },
            },
          },
        },
        department: true,
        position: true,
      },
    });
  }

  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password_hash: user.password_hash,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserWithPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto, files?: Express.Multer.File[]) {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: updateUserDto.email } });
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    const updateData: any = {
      name: updateUserDto.name,
      surname: updateUserDto.surname,
      email: updateUserDto.email,
      role: updateUserDto.role,
      positionId: updateUserDto.positionId,
      departmentId: updateUserDto.departmentId,
    };

    if (updateUserDto.password) {
      updateData.password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (
      updateUserDto.hireDate ||
      updateUserDto.salary !== undefined ||
      updateUserDto.contractType ||
      updateUserDto.status ||
      updateUserDto.benefits
    ) {
      let benefits = updateUserDto.benefits;
      if (benefits && typeof benefits !== 'string') {
        benefits = JSON.stringify(benefits);
      } else if (!benefits) {
        benefits = '{}';
      }

      const salaryValue = updateUserDto.salary !== undefined
        ? typeof updateUserDto.salary === 'string'
          ? parseFloat(updateUserDto.salary)
          : updateUserDto.salary
        : user.admissions?.salary || 0.0;

      updateData.admissions = {
        upsert: {
          where: { user_id: id },
          create: {
            hireDate: updateUserDto.hireDate ? new Date(updateUserDto.hireDate) : new Date(),
            contractType: updateUserDto.contractType || 'CLT',
            salary: salaryValue,
            status: updateUserDto.status || 'active',
            benefits: benefits,
          },
          update: {
            hireDate: updateUserDto.hireDate ? new Date(updateUserDto.hireDate) : user.admissions.hireDate,
            salary: salaryValue,
            contractType: updateUserDto.contractType || user.admissions.contractType,
            status: updateUserDto.status || user.admissions.status,
            benefits: benefits,
          },
        },
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        admissions: {
          select: {
            id: true,
            hireDate: true,
            contractType: true,
            salary: true,
            status: true,
            benefits: true,
            documents: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                filePath: true,
                uploadedAt: true,
              },
            },
          },
        },
        department: true,
        position: true,
      },
    });

    if (files && files.length > 0) {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        const filePath = path.join(uploadDir, path.basename(file.path));
        await this.prisma.admissionDocument.create({
          data: {
            admissionId: updatedUser.admissions.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: `/uploads/documents/${path.basename(file.path)}`,
            uploadedAt: new Date(),
            uploadedBy: updatedUser.id,
          },
        });
      }
    }

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    const admissionExists = await this.prisma.admission.findUnique({
      where: { user_id: id },
    });

    const updateData: any = {
      isActive: false,
      updatedAt: new Date(),
    };

    if (admissionExists) {
      updateData.admissions = {
        update: {
          where: { user_id: id },
          data: { status: 'terminated' },
        },
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        admissions: {
          include: {
            documents: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                filePath: true,
                uploadedAt: true,
              },
            },
          },
        },
        department: true,
        position: true,
      },
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        profile: true,
        admissions: {
          include: {
            documents: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                filePath: true,
                uploadedAt: true,
              },
            },
          },
        },
        department: true,
        position: true,
      },
    });
  }

  async uploadDocument(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { admissions: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    if (!user.admissions) {
      throw new NotFoundException(`Admissão não encontrada para o usuário com ID ${userId}`);
    }

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`).replace(/\\/g, '/');
    await fs.writeFile(filePath, file.buffer);

    const document = await this.prisma.admissionDocument.create({
      data: {
        admissionId: user.admissions.id,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: filePath.replace(new RegExp(`^${path.resolve(uploadDir)}`, 'i'), '/uploads/documents'),
        uploadedAt: new Date(),
      },
    });

    return {
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      filePath: document.filePath,
      uploadedAt: document.uploadedAt,
    };
  }

  async deleteDocument(userId: string, documentId: string) {
    const document = await this.prisma.admissionDocument.findUnique({
      where: { id: documentId },
      include: { admission: { include: { user: true } } },
    });

    if (!document || document.admission.user_id !== userId) {
      throw new NotFoundException('Documento ou usuário não encontrado');
    }

    try {
      await fs.unlink(path.join(__dirname, '..', '..', document.filePath));
    } catch (error) {
      console.warn(`Não foi possível remover o arquivo ${document.filePath}: ${error.message}`);
    }

    await this.prisma.admissionDocument.delete({
      where: { id: documentId },
    });

    return { message: 'Documento excluído com sucesso' };
  }

  async getDocument(userId: string, documentId: string) {
    const document = await this.prisma.admissionDocument.findUnique({
      where: { id: documentId },
      include: { admission: { include: { user: true } } },
    });

    if (!document || document.admission.user_id !== userId) {
      throw new NotFoundException('Documento ou usuário não encontrado');
    }

    return {
      fileName: document.fileName,
      fileType: document.fileType,
      filePath: path.join(__dirname, '..', '..', document.filePath),
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const profileData = {
      phone: updateData.phone,
      address: updateData.address,
    };

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: {
            where: { user_id: userId },
            data: profileData,
          },
        },
      },
      include: {
        profile: true,
        admissions: {
          select: {
            id: true,
            hireDate: true,
            contractType: true,
            salary: true,
            status: true,
            benefits: true,
            documents: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                filePath: true,
                uploadedAt: true,
              },
            },
          },
        },
        department: true,
        position: true,
      },
    });
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }  

    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }  

    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile'); // Corrigido para 'profile'
    await fs.mkdir(uploadDir, { recursive: true });  

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName).replace(/\\/g, '/');
    await fs.writeFile(filePath, file.buffer);  

    const avatarUrl = `/uploads/profile/${fileName}`; // Corrigido para '/uploads/profile/'  

    return await this.prisma.profile.update({
      where: { user_id: userId },
      data: { avatar: avatarUrl },
      include: { user: true },
    });
  }
}