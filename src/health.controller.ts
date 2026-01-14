import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Verifica se a API está funcionando'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'API está funcionando',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-14T20:00:00.000Z',
        uptime: 123.45
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
