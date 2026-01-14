import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const adminPermission = await prisma.permission.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Permissão para administrar artigos e usuários. Ações: Ler, Criar, Editar e Apagar artigos e usuários.',
    },
  });

  const editorPermission = await prisma.permission.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
      description: 'Permissão para administrar artigos. Ações: Ler, Criar, Editar e Apagar artigos.',
    },
  });

  const readerPermission = await prisma.permission.upsert({
    where: { name: 'reader' },
    update: {},
    create: {
      name: 'reader',
      description: 'Permissão para apenas ler artigos. Ações: Ler artigos.',
    },
  });

  console.log('Permissões criadas:', { adminPermission, editorPermission, readerPermission });

  // Criar usuário root
  const hashedPassword = await bcrypt.hash('root123', 10);

  const rootUser = await prisma.user.upsert({
    where: { email: 'root@admin.com' },
    update: {},
    create: {
      name: 'Root Admin',
      email: 'root@admin.com',
      password: hashedPassword,
      permissionId: adminPermission.id,
    },
  });

  console.log('Usuário root criado:', { email: rootUser.email, name: rootUser.name });
  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
