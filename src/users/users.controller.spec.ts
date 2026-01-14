import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: servicesMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = {
        id: '1',
        email: createUserDto.email,
        name: createUserDto.name,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.create.mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toEqual(result);
      expect(servicesMock.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          password: 'hashedPassword1',
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
    it('should return a single user', async () => {
      const result = {
        id: '1',
        email: 'user1@example.com',
        name: 'User 1',
        password: 'hashedPassword1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(servicesMock.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const result = {
        id: '1',
        email: 'user1@example.com',
        name: 'Updated Name',
        password: 'hashedPassword1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.update.mockResolvedValue(result);

      expect(await controller.update('1', updateUserDto)).toEqual(result);
      expect(servicesMock.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const result = {
        id: '1',
        email: 'user1@example.com',
        name: 'User 1',
        password: 'hashedPassword1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      servicesMock.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(servicesMock.remove).toHaveBeenCalledWith('1');
    });
  });
});
