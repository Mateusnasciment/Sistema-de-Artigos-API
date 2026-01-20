import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(
    skip?: number,
    take?: number,
    searchName?: string,
    minPrice?: number,
    maxPrice?: number,
    category?: string,
  ) {
    const where: any = {};

    if (searchName) {
      where.name = { contains: searchName, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
          if (!isNaN(Number(minPrice))) {
            where.price.gte = new Decimal(minPrice);
          }
      }
      if (maxPrice !== undefined) {
          if (!isNaN(Number(maxPrice))) {
            where.price.lte = new Decimal(maxPrice);
          }
      }
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: skip || 0,
        take: take || 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      skip: skip || 0,
      take: take || 10,
    };
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getCategories() {
    const products = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return products.map((p) => p.category);
  }
}
