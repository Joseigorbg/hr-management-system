import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { join } from 'path';
import { unlink, mkdir } from 'fs/promises';

@Injectable()
export class AdmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdmissionDto: CreateAdmissionDto, files?: Express.Multer.File[]) {
    console.log('DTO recebido para criação:', createAdmissionDto);
    const { userId, hireDate, salary, contractType, positionId, departmentId, status, benefits, phone, address, terminationDate, terminationReason } = createAdmissionDto;

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar positionId e departmentId
    if (positionId) {
      const position = await this.prisma.position.findUnique({ where: { id: positionId } });
      if (!position) {
        throw new NotFoundException('Cargo não encontrado');
      }
    }
    if (departmentId) {
      const department = await this.prisma.department.findUnique({ where: { id: departmentId } });
      if (!department) {
        throw new NotFoundException('Departamento não encontrado');
      }
    }

    // Validar benefits
    let parsedBenefits = '{}';
    if (benefits) {
      try {
        parsedBenefits = typeof benefits === 'string' ? benefits : JSON.stringify(benefits);
        JSON.parse(parsedBenefits);
      } catch {
        throw new BadRequestException('Formato de benefits inválido. Deve ser um JSON válido.');
      }
    }

    // Validar terminationDate e terminationReason se status for 'terminated'
    if (status === 'terminated' && (!terminationDate || !terminationReason)) {
      throw new BadRequestException('Data e motivo do desligamento são obrigatórios para status "terminated"');
    }

    // Criar admissão
    const admission = await this.prisma.admission.create({
      data: {
        user_id: userId,
        hireDate: new Date(hireDate),
        salary,
        contractType: contractType || 'CLT',
        position_id: positionId || null,
        department_id: departmentId || null,
        status: status || 'active',
        benefits: parsedBenefits,
        terminationDate: terminationDate ? new Date(terminationDate) : null,
        terminationReason: terminationReason || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            profile: true,
          },
        },
        position: true,
        department: true,
        documents: true,
      },
    });

    // Atualizar perfil do usuário com phone e address, se fornecidos
    if (phone || address) {
      await this.prisma.profile.upsert({
        where: { user_id: userId },
        update: {
          phone: phone || user.profile?.phone || '',
          address: address || user.profile?.address || '',
        },
        create: {
          user_id: userId,
          phone: phone || '',
          address: address || '',
          avatar: '/Uploads/profile/default-avatar.png',
        },
      });
    }

    // Salvar documentos, se fornecidos
    if (files && files.length > 0) {
      const uploadDir = join(__dirname, '..', '..', 'Uploads', 'documents');
      await mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        await this.prisma.admissionDocument.create({
          data: {
            admissionId: admission.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            uploadedBy: userId,
          },
        });
      }
    }

    return admission;
  }

  async update(id: string, updateAdmissionDto: UpdateAdmissionDto, files?: Express.Multer.File[]) {
    console.log('DTO recebido para atualização:', updateAdmissionDto);
    console.log('Arquivos recebidos:', files?.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })));

    const admission = await this.findOne(id);

    // Validar positionId e departmentId
    if (updateAdmissionDto.positionId) {
      const position = await this.prisma.position.findUnique({ where: { id: updateAdmissionDto.positionId } });
      if (!position) {
        throw new NotFoundException('Cargo não encontrado');
      }
    }
    if (updateAdmissionDto.departmentId) {
      const department = await this.prisma.department.findUnique({ where: { id: updateAdmissionDto.departmentId } });
      if (!department) {
        throw new NotFoundException('Departamento não encontrado');
      }
    }

    // Validar benefits
    let parsedBenefits = admission.benefits;
    if (updateAdmissionDto.benefits) {
      try {
        parsedBenefits = typeof updateAdmissionDto.benefits === 'string' ? updateAdmissionDto.benefits : JSON.stringify(updateAdmissionDto.benefits);
        JSON.parse(parsedBenefits);
      } catch {
        throw new BadRequestException('Formato de benefits inválido. Deve ser um JSON válido.');
      }
    }

    // Validar terminationDate e terminationReason se status for 'terminated'
    if (updateAdmissionDto.status === 'terminated' && (!updateAdmissionDto.terminationDate || !updateAdmissionDto.terminationReason)) {
      throw new BadRequestException('Data e motivo do desligamento são obrigatórios para status "terminated"');
    }

    const updateData: any = {
      user_id: updateAdmissionDto.userId || admission.user_id,
      hireDate: updateAdmissionDto.hireDate ? new Date(updateAdmissionDto.hireDate) : admission.hireDate,
      salary: updateAdmissionDto.salary !== undefined ? updateAdmissionDto.salary : admission.salary,
      contractType: updateAdmissionDto.contractType || admission.contractType,
      position_id: updateAdmissionDto.positionId || admission.position?.id || null,
      department_id: updateAdmissionDto.departmentId || admission.department?.id || null,
      status: updateAdmissionDto.status || admission.status,
      benefits: parsedBenefits,
      terminationDate: updateAdmissionDto.terminationDate ? new Date(updateAdmissionDto.terminationDate) : admission.terminationDate || null,
      terminationReason: updateAdmissionDto.terminationReason || admission.terminationReason || null,
    };

    const updatedAdmission = await this.prisma.admission.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            profile: true,
          },
        },
        position: true,
        department: true,
        documents: true,
      },
    });

    // Atualizar perfil do usuário com phone e address, se fornecidos
    if (updateAdmissionDto.phone || updateAdmissionDto.address) {
      await this.prisma.profile.upsert({
        where: { user_id: updateAdmissionDto.userId || admission.user_id },
        update: {
          phone: updateAdmissionDto.phone || admission.user.profile?.phone || '',
          address: updateAdmissionDto.address || admission.user.profile?.address || '',
        },
        create: {
          user_id: updateAdmissionDto.userId || admission.user_id,
          phone: updateAdmissionDto.phone || '',
          address: updateAdmissionDto.address || '',
          avatar: '/Uploads/profile/default-avatar.png',
        },
      });
    }

    // Salvar documentos, se fornecidos
    if (files && files.length > 0) {
      const uploadDir = join(__dirname, '..', '..', 'Uploads', 'documents');
      await mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        await this.prisma.admissionDocument.create({
          data: {
            admissionId: updatedAdmission.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            uploadedBy: updateAdmissionDto.userId || admission.user_id,
          },
        });
      }
    }

    return updatedAdmission;
  }

  async uploadDocument(admissionId: string, file: Express.Multer.File, uploadedBy: string) {
    console.log('Upload de documento:', { admissionId, file: { originalname: file.originalname, mimetype: file.mimetype, size: file.size }, uploadedBy });

    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException('Admissão não encontrada');
    }

    return this.prisma.admissionDocument.create({
      data: {
        admissionId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        uploadedBy,
      },
    });
  }

  async uploadDocuments(admissionId: string, files: Express.Multer.File[], uploadedBy: string) {
    console.log('Upload de múltiplos documentos:', { 
      admissionId, 
      files: files.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })), 
      uploadedBy 
    });

    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      throw new NotFoundException('Admissão não encontrada');
    }

    const uploadDir = join(__dirname, '..', '..', 'Uploads', 'documents');
    await mkdir(uploadDir, { recursive: true });

    const documents = [];
    for (const file of files) {
      const document = await this.prisma.admissionDocument.create({
        data: {
          admissionId,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          uploadedBy,
        },
      });
      documents.push(document);
    }

    return documents;
  }

  async deleteDocument(documentId: string) {
    const document = await this.prisma.admissionDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    try {
      await unlink(document.filePath);
    } catch (error) {
      console.warn('Erro ao excluir arquivo do disco:', error.message);
    }

    return this.prisma.admissionDocument.delete({
      where: { id: documentId },
    });
  }

  async findAll(page: number = 1, limit: number = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { position: { name: { contains: search, mode: 'insensitive' } } },
        { department: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [admissions, total] = await Promise.all([
      this.prisma.admission.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              profile: true,
            },
          },
          position: true,
          department: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admission.count({ where }),
    ]);

    return {
      data: admissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const admission = await this.prisma.admission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            profile: true,
          },
        },
        position: true,
        department: true,
        documents: true,
      },
    });

    if (!admission) {
      throw new NotFoundException('Admissão não encontrada');
    }

    return admission;
  }

  async findByUser(userId: string) {
    const admissions = await this.prisma.admission.findMany({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            profile: true,
          },
        },
        position: true,
        department: true,
        documents: true,
      },
    });

    if (!admissions || admissions.length === 0) {
      throw new NotFoundException('Nenhuma admissão encontrada para este usuário');
    }

    return admissions;
  }

  async remove(id: string) {
    const admission = await this.findOne(id);

    // Excluir documentos associados
    const documents = await this.prisma.admissionDocument.findMany({
      where: { admissionId: id },
    });

    for (const doc of documents) {
      try {
        await unlink(doc.filePath);
      } catch (error) {
        console.warn('Erro ao excluir arquivo do disco:', error.message);
      }
    }

    await this.prisma.admissionDocument.deleteMany({
      where: { admissionId: id },
    });

    return this.prisma.admission.delete({
      where: { id },
    });
  }

  async terminate(id: string, terminationDate?: string, terminationReason?: string) {
    await this.findOne(id);

    if (terminationDate && !terminationReason || !terminationDate && terminationReason) {
      throw new BadRequestException('Data e motivo do desligamento devem ser fornecidos juntos');
    }

    return this.prisma.admission.update({
      where: { id },
      data: {
        status: 'terminated',
        terminationDate: terminationDate ? new Date(terminationDate) : null,
        terminationReason: terminationReason || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            profile: true,
          },
        },
        position: true,
        department: true,
        documents: true,
      },
    });
  }

  async reactivate(id: string) {
    await this.findOne(id);

    return this.prisma.admission.update({
      where: { id },
      data: {
        status: 'active',
        terminationDate: null,
        terminationReason: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            profile: true,
          },
        },
        position: true,
        department: true,
        documents: true,
      },
    });
  }

  async getAdmissionsByDateRange(startDate: string, endDate: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [admissions, total] = await Promise.all([
      this.prisma.admission.findMany({
        where: {
          hireDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              profile: true,
            },
          },
          position: true,
          department: true,
          documents: true,
        },
        orderBy: { hireDate: 'desc' },
      }),
      this.prisma.admission.count({
        where: {
          hireDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      }),
    ]);

    return {
      data: admissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}