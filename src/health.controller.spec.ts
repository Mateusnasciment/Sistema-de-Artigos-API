import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });

    it('should have ok status', () => {
      const result = controller.health();

      expect(result.status).toBe('ok');
    });

    it('should have a valid timestamp', () => {
      const result = controller.health();

      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });
});
