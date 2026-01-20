import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
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

  // Criar produtos de exemplo
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Notebook Dell XPS 13',
        category: 'Eletrônicos',
        description: 'Notebook ultraportátil com processador Intel i7 de 13ª geração',
        price: new Decimal('3499.99'),
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
        stockQuantity: 5,
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Monitor LG 27" 4K',
        category: 'Eletrônicos',
        description: 'Monitor ultralargo com resolução 4K',
        price: new Decimal('1299.99'),
        imageUrl: 'https://images.unsplash.com/photo-1527721884081-3ff541e77119?w=400',
        stockQuantity: 8,
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Teclado Mecânico RGB',
        category: 'Eletrônicos',
        description: 'Teclado mecânico com switches Cherry MX',
        price: new Decimal('450.00'),
        imageUrl: 'https://images.unsplash.com/photo-1587829191301-6f5e5d37ea94?w=400',
        stockQuantity: 15,
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Clean Code',
        category: 'Livros',
        description: 'Um Código Limpo: Um Manual de Engenharia de Software',
        price: new Decimal('89.90'),
        imageUrl: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400',
        stockQuantity: 12,
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'The Pragmatic Programmer',
        category: 'Livros',
        description: 'Seu Caminho para o Código Melhor',
        price: new Decimal('79.90'),
        imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e01498c?w=400',
        stockQuantity: 10,
      },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: 'Cadeira Gamer',
        category: 'Móveis',
        description: 'Cadeira ergonômica para longas sessões de trabalho',
        price: new Decimal('1099.99'),
        imageUrl: 'https://images.unsplash.com/photo-1587280591708-88f1ff2d8e5f?w=400',
        stockQuantity: 3,
      },
    }),
    prisma.product.upsert({
      where: { id: 7 },
      update: {},
      create: {
        name: 'Mouse Logitech MX Master 3S',
        category: 'Eletrônicos',
        description: 'Mouse sem fio com precisão avançada',
        price: new Decimal('349.99'),
        imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
        stockQuantity: 20,
      },
    }),
    prisma.product.upsert({
      where: { id: 8 },
      update: {},
      create: {
        name: 'SSD Samsung 970 EVO 1TB',
        category: 'Eletrônicos',
        description: 'SSD NVMe ultrarrápido para armazenamento',
        price: new Decimal('279.99'),
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
        stockQuantity: 25,
      },
    }),
  ]);

  console.log(`${products.length} produtos criados/atualizados`);
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
