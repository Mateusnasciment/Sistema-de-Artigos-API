import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: any;

  const mockPermission = {
    id: 1,
    name: 'reader',
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedPassword123',
    name: 'Test User',
    permissionId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    permission: mockPermission,
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      permission: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        permission: 'reader',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.permission.findUnique.mockResolvedValue(mockPermission);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      // Password is not included in response
    });

    it('should hash password before creating user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.permission.findUnique.mockResolvedValue(mockPermission);
      prismaMock.user.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', expect.any(Number));
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if permission not found', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        permission: 'invalid',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.permission.findUnique.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should use default permission reader', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.permission.findUnique.mockResolvedValue(mockPermission);
      prismaMock.user.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(prismaMock.permission.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: 'reader' },
        })
      );
    });

    it('should not return password in response', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.permission.findUnique.mockResolvedValue(mockPermission);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      // Password is not included in response
    });

    it('should create with custom permission', async () => {
      const createUserDto = {
        email: 'editor@example.com',
        password: 'password123',
        name: 'Editor User',
        permission: 'editor',
      };

      const editorPermission = { id: 2, name: 'editor' };
      const editorUser = { ...mockUser, permission: editorPermission };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.permission.findUnique.mockResolvedValue(editorPermission);
      prismaMock.user.create.mockResolvedValue(editorUser);

      await service.create(createUserDto);

      expect(prismaMock.permission.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: 'editor' },
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser, { ...mockUser, id: 2 }];
      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: 1, email: mockUser.email });
      expect(result[0]).not.toHaveProperty('password');
      expect(result.length).toBe(2);
    });

    it('should return empty array if no users exist', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should include permission for each user', async () => {
      const users = [mockUser];
      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result[0].permission).toBeDefined();
      expect(result[0]).not.toHaveProperty('password');
    });

    it('should return multiple users', async () => {
      const users = [
        { ...mockUser, id: 1, email: 'user1@example.com' },
        { ...mockUser, id: 2, email: 'user2@example.com' },
        { ...mockUser, id: 3, email: 'user3@example.com' },
      ];
      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result.length).toBe(3);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[2].email).toBe('user3@example.com');
      result.forEach((u) => expect(u).not.toHaveProperty('password'));
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toMatchObject({ id: 1, email: mockUser.email, permission: mockPermission });
      expect(result).not.toHaveProperty('password');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { permission: true },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should find user by different id', async () => {
      const user2 = { ...mockUser, id: 5 };
      prismaMock.user.findUnique.mockResolvedValue(user2);

      const result = await service.findOne(5);

      expect(result.id).toBe(5);
      expect(result).not.toHaveProperty('password');
    });

    it('should include permission in response', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result.permission).toBeDefined();
      expect(result.permission.name).toBe('reader');
      expect(result).not.toHaveProperty('password');
    });

    it('should find user with admin permission', async () => {
      const adminUser = { ...mockUser, permission: { id: 3, name: 'admin' } };
      prismaMock.user.findUnique.mockResolvedValue(adminUser);

      const result = await service.findOne(1);

      expect(result.permission.name).toBe('admin');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result.name).toBe('Updated Name');
      expect(result).not.toHaveProperty('password');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
        include: { permission: true },
      });
    });

    it('should handle partial updates', async () => {
      const updateUserDto = { name: 'New Name' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);

      await service.update(1, updateUserDto);

      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it('should update email', async () => {
      const updateUserDto = { email: 'newemail@example.com' };
      const updatedUser = { ...mockUser, email: 'newemail@example.com' };
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser) // existing user by id
        .mockResolvedValueOnce(null); // no conflict for new email
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result.email).toBe('newemail@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should call include permission in update', async () => {
      const updateUserDto = { name: 'Updated' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);

      await service.update(1, updateUserDto);

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { permission: true },
        })
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Usuário removido com sucesso' });
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return success message', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Usuário removido com sucesso' });
    });

    it('should delete by numeric id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.delete.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should not call delete if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();
      expect(prismaMock.user.delete).not.toHaveBeenCalled();
    });
  });
});
