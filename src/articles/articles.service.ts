import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, authorId: number) {
    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        content: createArticleDto.content,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return article;
  }

  async findAll() {
    const articles = await this.prisma.article.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return articles;
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Artigo não encontrado');
    }

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto, userId: number, userPermission: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Artigo não encontrado');
    }

    // Apenas admin ou o próprio autor pode editar
    if (userPermission !== 'admin' && article.authorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este artigo');
    }

    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        title: updateArticleDto.title,
        content: updateArticleDto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedArticle;
  }

  async remove(id: number, userId: number, userPermission: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Artigo não encontrado');
    }

    // Apenas admin ou o próprio autor pode deletar
    if (userPermission !== 'admin' && article.authorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este artigo');
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Artigo removido com sucesso' };
  }
}
