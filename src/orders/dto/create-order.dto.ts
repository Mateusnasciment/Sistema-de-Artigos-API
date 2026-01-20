import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 1,
    type: Number,
  })
  productId: number;

  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
    type: Number,
  })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Itens do pedido',
    isArray: true,
    type: OrderItemDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
