import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service.js';
import { Order } from './schemas/order.schema.js';
import { OrderItem } from '../order-items/schemas/order-item.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { StockMovement } from '../stock/schemas/stock-movement.schema.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { StockMovementType } from '../stock/enums/stock-movement-type.enum.js';

const query = (result: unknown) => ({
  session: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue(result),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: Record<string, ReturnType<typeof vi.fn>>;
  let orderItemModel: Record<string, ReturnType<typeof vi.fn>>;
  let productModel: Record<string, ReturnType<typeof vi.fn>>;
  let stockMovementModel: Record<string, ReturnType<typeof vi.fn>>;
  let session: {
    withTransaction: ReturnType<typeof vi.fn>;
    endSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    session = {
      withTransaction: vi.fn(async (callback: () => Promise<unknown>) =>
        callback(),
      ),
      endSession: vi.fn().mockResolvedValue(undefined),
    };
    orderModel = {
      findOneAndUpdate: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: 'order-id' }),
      }),
      create: vi.fn().mockResolvedValue({
        customerName: 'Customer',
        status: OrderStatus.PENDING,
        totalAmount: 0,
      }),
      findByIdAndUpdate: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: 'order-id' }),
      }),
      findOne: vi.fn().mockReturnValue(
        query({
          _id: 'order-id',
          status: OrderStatus.PENDING,
        }),
      ),
      startSession: vi.fn().mockResolvedValue(session),
    };
    orderItemModel = {
      find: vi
        .fn()
        .mockReturnValue(query([{ product: 'product-id', quantity: 2 }])),
    };
    productModel = {
      updateOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ matchedCount: 1 }),
      }),
      findOne: vi.fn().mockReturnValue(query({ _id: 'product-id' })),
    };
    stockMovementModel = {
      create: vi.fn().mockResolvedValue([]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: orderModel,
        },
        {
          provide: getModelToken(OrderItem.name),
          useValue: orderItemModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: productModel,
        },
        {
          provide: getModelToken(StockMovement.name),
          useValue: stockMovementModel,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('soft deletes orders', async () => {
    await service.remove('order-id');

    expect(orderModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'order-id' },
      { $set: { deleted_at: expect.any(Date) } },
      { new: true },
    );
  });

  it('ships approved orders through the dedicated status transition', async () => {
    await service.ship('order-id');

    expect(orderModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: 'order-id',
        status: OrderStatus.APPROVED,
        deleted_at: null,
      },
      { $set: { status: OrderStatus.SHIPPED } },
      { new: true, runValidators: true },
    );
  });

  it('always creates a pending order with a server-controlled total', async () => {
    await service.create({
      customerName: 'Customer',
      status: OrderStatus.APPROVED,
      totalAmount: 999,
    });

    expect(orderModel.create).toHaveBeenCalledWith({
      customerName: 'Customer',
      status: OrderStatus.PENDING,
      totalAmount: 0,
    });
  });

  it('checks and decrements every item and records each movement in the transaction', async () => {
    orderItemModel.find.mockReturnValue(
      query([
        { product: 'product-id', quantity: 2 },
        { product: 'second-product-id', quantity: 3 },
      ]),
    );
    orderModel.findOneAndUpdate.mockReturnValue(
      query({ _id: 'order-id', status: OrderStatus.APPROVED }),
    );

    await service.update(
      'order-id',
      { status: OrderStatus.APPROVED },
      'approver-id',
    );

    expect(session.withTransaction).toHaveBeenCalledOnce();
    expect(productModel.updateOne).toHaveBeenCalledWith(
      {
        _id: 'product-id',
        deleted_at: null,
        quantityInStock: { $gte: 2 },
      },
      { $inc: { quantityInStock: -2 } },
      { session },
    );
    expect(productModel.updateOne).toHaveBeenNthCalledWith(
      2,
      {
        _id: 'second-product-id',
        deleted_at: null,
        quantityInStock: { $gte: 3 },
      },
      { $inc: { quantityInStock: -3 } },
      { session },
    );
    expect(stockMovementModel.create).toHaveBeenNthCalledWith(
      1,
      [
        {
          product: 'product-id',
          type: StockMovementType.OUT,
          quantity: 2,
          reason: 'Order order-id approved',
          createdBy: 'approver-id',
        },
      ],
      { session },
    );
    expect(stockMovementModel.create).toHaveBeenNthCalledWith(
      2,
      [
        {
          product: 'second-product-id',
          type: StockMovementType.OUT,
          quantity: 3,
          reason: 'Order order-id approved',
          createdBy: 'approver-id',
        },
      ],
      { session },
    );
    expect(orderModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: 'order-id',
        status: OrderStatus.PENDING,
        deleted_at: null,
      },
      { $set: { status: OrderStatus.APPROVED } },
      expect.objectContaining({ session, new: true, runValidators: true }),
    );
    expect(session.endSession).toHaveBeenCalledOnce();
  });

  it('does not record a movement or approve when a product lacks stock', async () => {
    productModel.updateOne.mockReturnValue({
      exec: vi.fn().mockResolvedValue({ matchedCount: 0 }),
    });

    await expect(
      service.update(
        'order-id',
        { status: OrderStatus.APPROVED },
        'approver-id',
      ),
    ).rejects.toThrow('Insufficient stock for product product-id');

    expect(stockMovementModel.create).not.toHaveBeenCalled();
    expect(orderModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalledOnce();
  });
});
