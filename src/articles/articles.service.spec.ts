import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prismaMock: any;

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
    it('should create a new article', async () => {
      const createArticleDto = {
        title: 'Test Article',
        content: 'This is a test article',
        authorId: '1',
      };

      const expectedArticle = {
        id: '1',
        title: 'Test Article',
        content: 'This is a test article',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.article.create.mockResolvedValue(expectedArticle);

      const result = await service.create(createArticleDto);

      expect(result).toEqual(expectedArticle);
      expect(prismaMock.article.create).toHaveBeenCalledWith({
        data: createArticleDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const articles = [
        {
          id: '1',
          title: 'Article 1',
          content: 'Content 1',
          authorId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Article 2',
          content: 'Content 2',
          authorId: '2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.article.findMany.mockResolvedValue(articles);

      const result = await service.findAll();

      expect(result).toEqual(articles);
      expect(prismaMock.article.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no articles exist', async () => {
      prismaMock.article.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      const article = {
        id: '1',
        title: 'Test Article',
        content: 'This is a test article',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.article.findUnique.mockResolvedValue(article);

      const result = await service.findOne('1');

      expect(result).toEqual(article);
      expect(prismaMock.article.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if article not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const updatedArticle = {
        id: '1',
        title: 'Updated Title',
        content: 'Updated Content',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.article.update.mockResolvedValue(updatedArticle);

      const result = await service.update('1', updateArticleDto);

      expect(result).toEqual(updatedArticle);
      expect(prismaMock.article.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateArticleDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete an article', async () => {
      const article = {
        id: '1',
        title: 'Test Article',
        content: 'This is a test article',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.article.delete.mockResolvedValue(article);

      const result = await service.remove('1');

      expect(result).toEqual(article);
      expect(prismaMock.article.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
