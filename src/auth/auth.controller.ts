import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/auth.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Autenticar usuário',
    description: 'Realiza login e retorna token JWT válido por 24h'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'Root Admin',
          email: 'root@admin.com',
          permission: 'admin'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.authService.validateUser(
      loginDto.email, 
      loginDto.password
    );
    return this.authService.login(user);
  }
}
