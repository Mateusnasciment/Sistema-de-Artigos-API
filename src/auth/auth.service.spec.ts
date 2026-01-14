import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
    permission: {
      id: 1,
      name: 'editor',
    },
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      // Password is not included in the returned object by the service
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should call findUnique with correct email', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await service.validateUser('test@example.com', 'password123');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        })
      );
    });

    it('should include permission in findUnique query', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await service.validateUser('test@example.com', 'password123');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { permission: true },
        })
      );
    });

    it('should handle different email addresses', async () => {
      const anotherUser = { ...mockUser, email: 'another@example.com' };
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(anotherUser);

      const result = await service.validateUser('another@example.com', 'password123');

      expect(result.email).toBe('another@example.com');
    });

    it('should compare password with bcrypt', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await service.validateUser('test@example.com', 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return user with permission data', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result.permission).toBeDefined();
      expect(result.permission.name).toBe('editor');
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe(token);
    });

    it('should return user info without password', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('permission');
      // Password is not included in user response
    });

    it('should sign jwt with correct payload', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      await service.login(mockUser);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUser.email,
          sub: mockUser.id,
          permission: mockUser.permission.name,
        })
      );
    });

    it('should return user permission name', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result.user.permission).toBe('editor');
    });

    it('should handle different user roles', async () => {
      const adminUser = { ...mockUser, permission: { id: 2, name: 'admin' } };
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(adminUser);

      expect(result.user.permission).toBe('admin');
    });

    it('should include user id in token payload', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      await service.login(mockUser);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
        })
      );
    });

    it('should return user name in response', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result.user.name).toBe('Test User');
    });

    it('should return different tokens for different users', async () => {
      const token1 = 'token1';
      const token2 = 'token2';
      jwtServiceMock.sign.mockReturnValueOnce(token1).mockReturnValueOnce(token2);

      const result1 = await service.login(mockUser);
      const result2 = await service.login({ ...mockUser, id: 2 });

      expect(result1.access_token).toBe(token1);
      expect(result2.access_token).toBe(token2);
    });

    it('should include user email in token payload', async () => {
      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      await service.login(mockUser);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });
  });
});
