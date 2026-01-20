import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  product: {
    update: jest.fn(),
  },
};

const mockProductsService = {
  findOne: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let products: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    products = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order and decrement product stock', async () => {
      const createOrderDto = {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      const mockProduct1 = {
        id: 1,
        name: 'Product 1',
        stockQuantity: 10,
        price: 100,
      };

      const mockProduct2 = {
        id: 2,
        name: 'Product 2',
        stockQuantity: 5,
        price: 50,
      };

      mockProductsService.findOne
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);

      const mockOrder = {
        id: 1,
        status: 'Pendente',
        totalPrice: 250,
        items: createOrderDto.items,
      };

      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockProductsService.findOne).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.product.update).toHaveBeenCalledTimes(2);
    });

    it('should throw error if product not found', async () => {
      const createOrderDto = {
        items: [{ productId: 999, quantity: 1 }],
      };

      mockProductsService.findOne.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if insufficient stock', async () => {
      const createOrderDto = {
        items: [{ productId: 1, quantity: 100 }],
      };

      const mockProduct = {
        id: 1,
        name: 'Product 1',
        stockQuantity: 5,
        price: 100,
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct);

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = [
        {
          id: 1,
          status: 'Pendente',
          totalPrice: 250,
          items: [],
        },
        {
          id: 2,
          status: 'Concluído',
          totalPrice: 150,
          items: [],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.items).toEqual(mockOrders);
      expect(result.total).toEqual(2);
    });
  });
});
