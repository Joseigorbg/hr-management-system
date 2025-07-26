import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test2@example.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  let department = await prisma.department.findUnique({
    where: { name: 'IT Department' },
  });

  if (!department) {
    department = await prisma.department.create({
      data: {
        name: 'IT Department',
        description: 'TI',
      },
    });
    console.log('Departamento IT criado com sucesso.');
  } else {
    console.log('Departamento IT já existe.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'admin',
        departmentId: department.id, // Associa o usuário ao departamento
      },
    });
    console.log(`Usuário ${email} criado com sucesso.`);
  } else {
    console.log(`Usuário ${email} já existe.`);
  }

  // Atualizar o departamento com o managerId do usuário criado
  if (!department.managerId && existingUser) {
    await prisma.department.update({
      where: { id: department.id },
      data: { managerId: existingUser.id },
    });
    console.log('Departamento atualizado com managerId.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });