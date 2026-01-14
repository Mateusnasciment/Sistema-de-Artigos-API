import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'Meu Primeiro Artigo', description: 'Título do artigo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Conteúdo do artigo...', description: 'Conteúdo do artigo' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
