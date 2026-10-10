import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MethodNotAllowedException } from '@nestjs/common';
import { StockService } from './stock.service.js';
import { StockMovement } from './schemas/stock-movement.schema.js';
import { Product } from '../products/schemas/product.schema.js';

describe('StockService', () => {
  let service: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: getModelToken(StockMovement.name), useValue: {} },
        { provide: getModelToken(Product.name), useValue: {} },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not allow stock movements to be updated', () => {
    expect(() => service.update('movement-id')).toThrow(
      MethodNotAllowedException,
    );
  });

  it('does not allow stock movements to be deleted', () => {
    expect(() => service.remove('movement-id')).toThrow(
      MethodNotAllowedException,
    );
  });
});
