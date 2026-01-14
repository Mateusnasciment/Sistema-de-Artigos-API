import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('Articles')
@ApiBearerAuth('access-token')
@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Permissions('admin', 'editor')
  @ApiOperation({ summary: 'Criar novo artigo' })
  @ApiResponse({ status: 201, description: 'Artigo criado com sucesso' })
  create(@Body() createArticleDto: CreateArticleDto, @CurrentUser() user: any) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  @Permissions('admin', 'editor', 'reader')
  @ApiOperation({ summary: 'Listar todos os artigos' })
  @ApiResponse({ status: 200, description: 'Lista de artigos' })
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @Permissions('admin', 'editor', 'reader')
  @ApiOperation({ summary: 'Obter artigo por ID' })
  @ApiResponse({ status: 200, description: 'Artigo encontrado' })
  @ApiResponse({ status: 404, description: 'Artigo não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('admin', 'editor')
  @ApiOperation({ summary: 'Atualizar artigo' })
  @ApiResponse({ status: 200, description: 'Artigo atualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.update(id, updateArticleDto, user.id, user.permission);
  }

  @Delete(':id')
  @Permissions('admin', 'editor')
  @ApiOperation({ summary: 'Deletar artigo' })
  @ApiResponse({ status: 200, description: 'Artigo deletado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.articlesService.remove(id, user.id, user.permission);
  }
}
