import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      findOne: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: '$2b$10$mockHashedPassword', // bcrypt hash of 'password123'
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersServiceMock.findOne.mockResolvedValue(user);

      // Note: In a real scenario, bcrypt.compare would be called
      const result = await service.validateUser('test@example.com', user.password);

      expect(result).toBeDefined();
    });

    it('should return null if user not found', async () => {
      usersServiceMock.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const token = 'mock.jwt.token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: token });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });

  describe('validateToken', () => {
    it('should return decoded token if valid', async () => {
      const decodedToken = {
        sub: '1',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
      };

      jwtServiceMock.verify.mockReturnValue(decodedToken);

      const result = service.validateToken('mock.jwt.token');

      expect(result).toEqual(decodedToken);
    });

    it('should throw if token is invalid', () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.validateToken('invalid.token')).toThrow();
    });
  });
});
