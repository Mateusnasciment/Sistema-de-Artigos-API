import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // Validar se todos os produtos existem e há estoque suficiente
    let totalPrice = 0;

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${item.productId} não encontrado`,
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Quantidade insuficiente em estoque para o produto ${product.name}. Disponível: ${product.stockQuantity}, Solicitado: ${item.quantity}`,
        );
      }

      totalPrice += product.price.toNumber() * item.quantity;
    }

    // Criar o pedido
    const order = await this.prisma.order.create({
      data: {
        status: 'Pendente',
        totalPrice,
        items: {
          create: createOrderDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.quantity, // Will be updated with actual price
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Atualizar estoque dos produtos
    for (const item of createOrderDto.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  }

  async findAll(skip?: number, take?: number, status?: string) {
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: skip || 0,
        take: take || 10,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      skip: skip || 0,
      take: take || 10,
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    // Se o status está sendo alterado para "Concluído" e o pedido é novo, atualizar estoque
    if (
      updateOrderDto.status &&
      updateOrderDto.status === 'Concluído' &&
      order.status !== 'Concluído'
    ) {
      // Estoque já foi decrementado ao criar o pedido
      // Aqui apenas confirmamos a conclusão
    }

    // Se o status está sendo alterado para "Cancelado", restaurar estoque
    if (
      updateOrderDto.status &&
      updateOrderDto.status === 'Cancelado' &&
      order.status !== 'Cancelado'
    ) {
      for (const item of order.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const order = await this.findOne(id);

    // Se o pedido não está cancelado, restaurar o estoque
    if (order.status !== 'Cancelado') {
      for (const item of order.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
