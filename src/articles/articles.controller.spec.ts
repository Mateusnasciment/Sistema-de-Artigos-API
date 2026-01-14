import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let servicesMock: any;

  const mockArticle = {
    id: 1,
    title: 'Test Article',
    content: 'Content',
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    permission: 'editor',
  };

  beforeEach(async () => {
    servicesMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: servicesMock,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an article', async () => {
      const createArticleDto = {
        title: 'Test Article',
        content: 'Content',
      };

      servicesMock.create.mockResolvedValue(mockArticle);

      const result = await controller.create(createArticleDto, mockUser);

      expect(result).toEqual(mockArticle);
      expect(servicesMock.create).toHaveBeenCalledWith(createArticleDto, mockUser.id);
    });

    it('should pass user id to service', async () => {
      const createArticleDto = {
        title: 'Another Article',
        content: 'Another Content',
      };

      const differentUser = { ...mockUser, id: 2 };
      servicesMock.create.mockResolvedValue({ ...mockArticle, authorId: 2 });

      await controller.create(createArticleDto, differentUser);

      expect(servicesMock.create).toHaveBeenCalledWith(createArticleDto, 2);
    });

    it('should return created article', async () => {
      const createArticleDto = {
        title: 'Test',
        content: 'Content',
      };

      servicesMock.create.mockResolvedValue(mockArticle);

      const result = await controller.create(createArticleDto, mockUser);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Article');
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const articles = [mockArticle, { ...mockArticle, id: 2 }];
      servicesMock.findAll.mockResolvedValue(articles);

      const result = await controller.findAll();

      expect(result).toEqual(articles);
      expect(result.length).toBe(2);
      expect(servicesMock.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no articles exist', async () => {
      servicesMock.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should call service without parameters', async () => {
      servicesMock.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(servicesMock.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      servicesMock.findOne.mockResolvedValue(mockArticle);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockArticle);
      expect(servicesMock.findOne).toHaveBeenCalledWith(1);
    });

    it('should call service with numeric id', async () => {
      servicesMock.findOne.mockResolvedValue(mockArticle);

      await controller.findOne(5);

      expect(servicesMock.findOne).toHaveBeenCalledWith(5);
    });

    it('should return article with correct id', async () => {
      const article2 = { ...mockArticle, id: 2 };
      servicesMock.findOne.mockResolvedValue(article2);

      const result = await controller.findOne(2);

      expect(result.id).toBe(2);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      const updatedArticle = { ...mockArticle, title: 'Updated Title' };
      servicesMock.update.mockResolvedValue(updatedArticle);

      const result = await controller.update(1, updateArticleDto, mockUser);

      expect(result).toEqual(updatedArticle);
      expect(servicesMock.update).toHaveBeenCalledWith(
        1,
        updateArticleDto,
        mockUser.id,
        mockUser.permission
      );
    });

    it('should pass user permission to service', async () => {
      const updateArticleDto = { content: 'Updated content' };
      const adminUser = { ...mockUser, permission: 'admin' };

      servicesMock.update.mockResolvedValue(mockArticle);

      await controller.update(1, updateArticleDto, adminUser);

      expect(servicesMock.update).toHaveBeenCalledWith(1, updateArticleDto, adminUser.id, 'admin');
    });

    it('should handle partial updates', async () => {
      const updateArticleDto = { title: 'New Title' };
      servicesMock.update.mockResolvedValue(mockArticle);

      await controller.update(1, updateArticleDto, mockUser);

      expect(servicesMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an article', async () => {
      servicesMock.remove.mockResolvedValue(mockArticle);

      const result = await controller.remove(1, mockUser);

      expect(result).toEqual(mockArticle);
      expect(servicesMock.remove).toHaveBeenCalledWith(1, mockUser.id, mockUser.permission);
    });

    it('should pass correct user info to service', async () => {
      const adminUser = { ...mockUser, permission: 'admin' };
      servicesMock.remove.mockResolvedValue(mockArticle);

      await controller.remove(1, adminUser);

      expect(servicesMock.remove).toHaveBeenCalledWith(1, adminUser.id, 'admin');
    });

    it('should return deleted article', async () => {
      servicesMock.remove.mockResolvedValue(mockArticle);

      const result = await controller.remove(1, mockUser);

      expect(result).toEqual(mockArticle);
    });
  });
});
