import { IsString, IsNumber, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Nome do produto', example: 'Notebook Dell' })
  @IsString()
  @MinLength(1, { message: 'Nome deve ter pelo menos 1 caractere' })
  name: string;

  @ApiProperty({
    description: 'Categoria do produto',
    example: 'Eletrônicos',
  })
  @IsString()
  @MinLength(1, { message: 'Categoria é obrigatória' })
  category: string;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Notebook com processador Intel i7',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Preço do produto em reais',
    example: 3499.99,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Preço deve ser maior ou igual a 0' })
  price: number;

  @ApiProperty({
    description: 'URL da imagem do produto',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 10,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Quantidade deve ser um número não negativo' })
  stockQuantity: number = 0;
}
