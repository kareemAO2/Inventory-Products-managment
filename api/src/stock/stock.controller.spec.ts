import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller.js';
import { StockService } from './stock.service.js';
import { StockMovementType } from './enums/stock-movement-type.enum.js';

describe('StockController', () => {
  let controller: StockController;
  const stockService = { create: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: stockService,
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('always records the authenticated user as the movement creator', () => {
    void controller.create(
      {
        product: 'product-id',
        type: StockMovementType.IN,
        quantity: 4,
        reason: 'Restock',
        created_by: 'spoofed-user-id',
      },
      'authenticated-user-id',
    );

    expect(stockService.create).toHaveBeenCalledWith({
      product: 'product-id',
      type: StockMovementType.IN,
      quantity: 4,
      reason: 'Restock',
      created_by: 'authenticated-user-id',
    });
  });
});
