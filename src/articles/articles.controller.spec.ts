import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let servicesMock: any;

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
        authorId: '1',
      };

      const result = {
        id: '1',
        ...createArticleDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.create.mockResolvedValue(result);

      expect(await controller.create(createArticleDto)).toEqual(result);
      expect(servicesMock.create).toHaveBeenCalledWith(createArticleDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const result = [
        {
          id: '1',
          title: 'Article 1',
          content: 'Content 1',
          authorId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      servicesMock.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(servicesMock.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      const result = {
        id: '1',
        title: 'Article 1',
        content: 'Content 1',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(servicesMock.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      const result = {
        id: '1',
        title: 'Updated Title',
        content: 'Content 1',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.update.mockResolvedValue(result);

      expect(await controller.update('1', updateArticleDto)).toEqual(result);
      expect(servicesMock.update).toHaveBeenCalledWith('1', updateArticleDto);
    });
  });

  describe('remove', () => {
    it('should delete an article', async () => {
      const result = {
        id: '1',
        title: 'Article 1',
        content: 'Content 1',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(servicesMock.remove).toHaveBeenCalledWith('1');
    });
  });
});
