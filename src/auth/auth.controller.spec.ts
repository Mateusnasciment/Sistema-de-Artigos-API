import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let servicesMock: any;

  const mockLoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    permission: {
      id: 1,
      name: 'editor',
    },
  };

  const mockAuthResponse = {
    access_token: 'mock.jwt.token',
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      permission: 'editor',
    },
  };

  beforeEach(async () => {
    servicesMock = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: servicesMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(result).toHaveProperty('access_token');
    });

    it('should have access token property', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(typeof result.access_token).toBe('string');
    });

    it('should return user info in response', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should return user email', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.user.email).toBe('test@example.com');
    });

    it('should return user name', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.user.name).toBe('Test User');
    });

    it('should call service with user object (via passport)', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      // In real scenario, Passport provides user via decorator
      // Here we're testing the login logic
      await controller.login(mockLoginDto);

      expect(servicesMock.login).toHaveBeenCalled();
    });

    it('should handle different email addresses', async () => {
      const differentDto = { ...mockLoginDto, email: 'another@example.com' };
      servicesMock.login.mockResolvedValue({ ...mockAuthResponse });

      await controller.login(differentDto);

      expect(servicesMock.login).toHaveBeenCalled();
    });

    it('should return user permission', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.user.permission).toBe('editor');
    });

    it('should return token as string', async () => {
      servicesMock.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.access_token).not.toBeNull();
      expect(result.access_token.length).toBeGreaterThan(0);
    });

    it('should handle admin user login', async () => {
      const adminResponse = {
        ...mockAuthResponse,
        user: { ...mockAuthResponse.user, permission: 'admin' },
      };
      servicesMock.login.mockResolvedValue(adminResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.user.permission).toBe('admin');
    });
  });
});
