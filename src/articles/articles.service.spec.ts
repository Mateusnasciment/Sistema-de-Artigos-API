import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prismaMock: any;

  const mockArticle = {
    id: 1,
    title: 'Test Article',
    content: 'This is a test article',
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    prismaMock = {
      article: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article with author', async () => {
      const createArticleDto = {
        title: 'New Article',
        content: 'New content',
      };
      const authorId = 1;

      prismaMock.article.create.mockResolvedValue(mockArticle);

      const result = await service.create(createArticleDto, authorId);

      expect(result).toEqual(mockArticle);
      expect(prismaMock.article.create).toHaveBeenCalledWith({
        data: {
          title: createArticleDto.title,
          content: createArticleDto.content,
          authorId,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });

    it('should create article with different author', async () => {
      const createArticleDto = {
        title: 'Another Article',
        content: 'Another content',
      };
      const authorId = 2;

      const mockArticle2 = { ...mockArticle, authorId: 2, id: 2 };
      prismaMock.article.create.mockResolvedValue(mockArticle2);

      const result = await service.create(createArticleDto, authorId);

      expect(result.authorId).toBe(2);
      expect(prismaMock.article.create).toHaveBeenCalled();
    });

    it('should include author info in response', async () => {
      const createArticleDto = {
        title: 'Test Article',
        content: 'Content',
      };

      prismaMock.article.create.mockResolvedValue(mockArticle);

      const result = await service.create(createArticleDto, 1);

      expect(result.author).toBeDefined();
      expect(result.author.name).toBe('Test User');
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const articles = [mockArticle, { ...mockArticle, id: 2 }];
      prismaMock.article.findMany.mockResolvedValue(articles);

      const result = await service.findAll();

      expect(result).toEqual(articles);
      expect(result.length).toBe(2);
    });

    it('should return empty array if no articles exist', async () => {
      prismaMock.article.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should order articles by creation date descending', async () => {
      const articles = [mockArticle];
      prismaMock.article.findMany.mockResolvedValue(articles);

      await service.findAll();

      expect(prismaMock.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should include author info for all articles', async () => {
      const articles = [mockArticle];
      prismaMock.article.findMany.mockResolvedValue(articles);

      const result = await service.findAll();

      expect(result[0].author).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      const result = await service.findOne(1);

      expect(result).toEqual(mockArticle);
      expect(prismaMock.article.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });

    it('should throw NotFoundException if article not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should find article by different id', async () => {
      const mockArticle2 = { ...mockArticle, id: 5 };
      prismaMock.article.findUnique.mockResolvedValue(mockArticle2);

      const result = await service.findOne(5);

      expect(result.id).toBe(5);
    });

    it('should include author with select fields', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      const result = await service.findOne(1);

      expect(result.author).toHaveProperty('id');
      expect(result.author).toHaveProperty('name');
      expect(result.author).toHaveProperty('email');
    });
  });

  describe('update', () => {
    it('should update article if user is author', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      const updatedArticle = { ...mockArticle, ...updateArticleDto };
      prismaMock.article.update.mockResolvedValue(updatedArticle);

      const result = await service.update(1, updateArticleDto, 1, 'editor');

      expect(result).toEqual(updatedArticle);
      expect(prismaMock.article.update).toHaveBeenCalled();
    });

    it('should update article if user is admin', async () => {
      const updateArticleDto = {
        title: 'Updated by Admin',
        content: 'Admin update',
      };

      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      const updatedArticle = { ...mockArticle, ...updateArticleDto };
      prismaMock.article.update.mockResolvedValue(updatedArticle);

      const result = await service.update(1, updateArticleDto, 2, 'admin');

      expect(result).toEqual(updatedArticle);
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      await expect(service.update(1, updateArticleDto, 2, 'editor')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException if article does not exist', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateArticleDto, 1, 'admin')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should verify article exists before updating', async () => {
      const updateArticleDto = { title: 'New Title' };

      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      prismaMock.article.update.mockResolvedValue(mockArticle);

      await service.update(1, updateArticleDto, 1, 'editor');

      expect(prismaMock.article.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should only update title and content fields', async () => {
      const updateArticleDto = {
        title: 'New Title',
        content: 'New Content',
      };

      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      prismaMock.article.update.mockResolvedValue(mockArticle);

      await service.update(1, updateArticleDto, 1, 'admin');

      expect(prismaMock.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            title: updateArticleDto.title,
            content: updateArticleDto.content,
          },
        })
      );
    });
  });

  describe('remove', () => {
    it('should delete article if user is author', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      prismaMock.article.delete.mockResolvedValue(mockArticle);

      const result = await service.remove(1, 1, 'editor');

      expect(result).toEqual({ message: 'Artigo removido com sucesso' });
      expect(prismaMock.article.delete).toHaveBeenCalled();
    });

    it('should delete article if user is admin', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      prismaMock.article.delete.mockResolvedValue(mockArticle);

      const result = await service.remove(1, 2, 'admin');

      expect(result).toEqual({ message: 'Artigo removido com sucesso' });
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      await expect(service.remove(1, 2, 'reader')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if article does not exist', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 1, 'admin')).rejects.toThrow(NotFoundException);
    });

    it('should check permissions before deleting', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);
      prismaMock.article.delete.mockResolvedValue(mockArticle);

      await service.remove(1, 1, 'editor');

      expect(prismaMock.article.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

      it('should not delete if user is reader', async () => {
        prismaMock.article.findUnique.mockResolvedValue(mockArticle);

        // User 2 is a reader trying to delete an article written by user 1
        await expect(service.remove(1, 2, 'reader')).rejects.toThrow(ForbiddenException);
        expect(prismaMock.article.delete).not.toHaveBeenCalled();
      });
  });
});
