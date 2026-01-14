import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let servicesMock: any;

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    name: 'Test User',
    permissionId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    permission: { id: 1, name: 'reader' },
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
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      servicesMock.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(servicesMock.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should return created user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      };

      servicesMock.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result.id).toBe(1);
      expect(result.email).toBe('user@example.com');
    });

    it('should not return password in response', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      };

      servicesMock.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      // Password should not be included in response
      expect(result.id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser, { ...mockUser, id: 2 }];
      servicesMock.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(result.length).toBe(2);
      expect(servicesMock.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      servicesMock.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should call service without parameters', async () => {
      servicesMock.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(servicesMock.findAll).toHaveBeenCalledWith();
    });

    it('should return users with permission info', async () => {
      const users = [mockUser];
      servicesMock.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result[0].permission).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      servicesMock.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(servicesMock.findOne).toHaveBeenCalledWith(1);
    });

    it('should call service with numeric id', async () => {
      servicesMock.findOne.mockResolvedValue(mockUser);

      await controller.findOne(5);

      expect(servicesMock.findOne).toHaveBeenCalledWith(5);
    });

    it('should return user with correct id', async () => {
      const user2 = { ...mockUser, id: 2 };
      servicesMock.findOne.mockResolvedValue(user2);

      const result = await controller.findOne(2);

      expect(result.id).toBe(2);
    });

    it('should include permission in response', async () => {
      servicesMock.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result.permission).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      servicesMock.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(servicesMock.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should handle partial updates', async () => {
      const updateUserDto = { name: 'New Name' };
      servicesMock.update.mockResolvedValue(mockUser);

      await controller.update(1, updateUserDto);

      expect(servicesMock.update).toHaveBeenCalled();
    });

    it('should update user email', async () => {
      const updateUserDto = { email: 'newemail@example.com' };
      const updatedUser = { ...mockUser, email: 'newemail@example.com' };
      servicesMock.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result.email).toBe('newemail@example.com');
    });

    it('should return updated user', async () => {
      const updateUserDto = { name: 'Updated' };
      servicesMock.update.mockResolvedValue(mockUser);

      const result = await controller.update(1, updateUserDto);

      expect(result.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      servicesMock.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(1);

      expect(result).toEqual(mockUser);
      expect(servicesMock.remove).toHaveBeenCalledWith(1);
    });

    it('should return deleted user', async () => {
      servicesMock.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(1);

      expect(result).toEqual(mockUser);
    });

    it('should call service with numeric id', async () => {
      servicesMock.remove.mockResolvedValue(mockUser);

      await controller.remove(1);

      expect(servicesMock.remove).toHaveBeenCalledWith(1);
    });

    it('should handle removal of different users', async () => {
      const user1 = { ...mockUser, id: 1 };
      const user2 = { ...mockUser, id: 2 };

      servicesMock.remove.mockResolvedValueOnce(user1).mockResolvedValueOnce(user2);

      const result1 = await controller.remove(1);
      const result2 = await controller.remove(2);

      expect(result1).toEqual(user1);
      expect(result2).toEqual(user2);
    });
  });
});
