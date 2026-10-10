import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: {
    findAll: ReturnType<typeof vi.fn>;
    findLowStock: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    productsService = { findAll: vi.fn(), findLowStock: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('parses and forwards list query parameters', async () => {
    await controller.findAll({ page: '3', q: 'hat' });

    expect(productsService.findAll).toHaveBeenCalledWith({
      page: 3,
      limit: 20,
      q: 'hat',
    });
  });

  it('rejects invalid list query parameters', () => {
    expect(() => controller.findAll({ limit: '0' })).toThrow();
  });

  it('returns low-stock products', async () => {
    await controller.findLowStock();

    expect(productsService.findLowStock).toHaveBeenCalledOnce();
  });
});
