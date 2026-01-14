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

  describe('GET /health', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('ok');
    });

    it('should have ok status', () => {
      const result = controller.check();

      expect(result.status).toBe('ok');
    });

    it('should have a valid timestamp', () => {
      const result = controller.check();

      expect(result).toHaveProperty('timestamp');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should have uptime property', () => {
      const result = controller.check();

      expect(result).toHaveProperty('uptime');
      expect(typeof result.uptime).toBe('number');
    });

    it('should return numeric uptime value', () => {
      const result = controller.check();

      expect(result.uptime).toBeGreaterThan(0);
    });

    it('should return consistent status on multiple calls', () => {
      const result1 = controller.check();
      const result2 = controller.check();

      expect(result1.status).toBe(result2.status);
    });

    it('should have ISO format timestamp', () => {
      const result = controller.check();

      const date = new Date(result.timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(!isNaN(date.getTime())).toBe(true);
    });
  });
});
