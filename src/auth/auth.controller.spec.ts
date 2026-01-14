import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let servicesMock: any;

  beforeEach(async () => {
    servicesMock = {
      validateUser: jest.fn(),
      login: jest.fn(),
      validateToken: jest.fn(),
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
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = {
        access_token: 'mock.jwt.token',
      };

      servicesMock.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toEqual(result);
      expect(servicesMock.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
