import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Status do pedido',
    enum: ['Pendente', 'Concluído', 'Cancelado'],
    example: 'Concluído',
    required: false,
  })
  @IsOptional()
  @IsEnum(['Pendente', 'Concluído', 'Cancelado'])
  status?: string;
}
