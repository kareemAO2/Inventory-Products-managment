import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderItemDto } from './dto/create-order-item.dto.js';
import { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema.js';
import { Order, OrderDocument } from '../orders/schemas/order.schema.js';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItemDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    const session = await this.orderModel.startSession();
    try {
      return await session.withTransaction(async () => {
        const order = await this.orderModel
          .findOne({
            _id: createOrderItemDto.order,
            status: OrderStatus.PENDING,
            deleted_at: null,
          })
          .session(session)
          .exec();
        if (!order) {
          const exists = await this.orderModel
            .findOne({ _id: createOrderItemDto.order, deleted_at: null })
            .session(session)
            .select('_id')
            .exec();
          if (!exists) {
            throw new NotFoundException(
              `Order with ID ${createOrderItemDto.order} not found`,
            );
          }
          throw new BadRequestException(
            'Items can only be added to pending orders',
          );
        }

        const product = await this.productModel
          .findOne({ _id: createOrderItemDto.product, deleted_at: null })
          .session(session)
          .exec();
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${createOrderItemDto.product} not found`,
          );
        }

        const [item] = await this.orderItemModel.create(
          [
            {
              order: createOrderItemDto.order,
              product: createOrderItemDto.product,
              quantity: createOrderItemDto.quantity,
              unitPrice: product.price,
            },
          ],
          { session },
        );
        await this.orderModel
          .updateOne(
            { _id: order._id, status: OrderStatus.PENDING, deleted_at: null },
            { $inc: { totalAmount: product.price * createOrderItemDto.quantity } },
            { session },
          )
          .exec();
        return item;
      });
    } finally {
      await session.endSession();
    }
  }

  findAll() {
    return this.orderItemModel
      .find({ deleted_at: null })
      .populate('product')
      .exec();
  }

  async findOne(id: string) {
    const item = await this.orderItemModel
      .findById(id)
      .populate('product')
      .exec();
    if (!item) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    if (updateOrderItemDto.quantity === undefined) {
      throw new BadRequestException('Quantity is required');
    }
    const quantity = updateOrderItemDto.quantity;
    const session = await this.orderModel.startSession();
    try {
      return await session.withTransaction(async () => {
        const item = await this.orderItemModel
          .findById(id)
          .session(session)
          .exec();
        if (!item) {
          throw new NotFoundException(`Order item with ID ${id} not found`);
        }
        const order = await this.orderModel
          .findOne({
            _id: item.order,
            status: OrderStatus.PENDING,
            deleted_at: null,
          })
          .session(session)
          .exec();
        if (!order) {
          throw new BadRequestException(
            'Items can only be changed on pending orders',
          );
        }

        const amountChange =
          item.unitPrice * (quantity - item.quantity);
        item.quantity = quantity;
        await item.save({ session });
        await this.orderModel
          .updateOne(
            { _id: order._id, status: OrderStatus.PENDING },
            { $inc: { totalAmount: amountChange } },
            { session },
          )
          .exec();
        return item;
      });
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string) {
    const session = await this.orderModel.startSession();
    try {
      return await session.withTransaction(async () => {
        const item = await this.orderItemModel
          .findById(id)
          .session(session)
          .exec();
        if (!item) {
          throw new NotFoundException(`Order item with ID ${id} not found`);
        }
        const order = await this.orderModel
          .findOne({
            _id: item.order,
            status: OrderStatus.PENDING,
            deleted_at: null,
          })
          .session(session)
          .exec();
        if (!order) {
          throw new BadRequestException(
            'Items can only be removed from pending orders',
          );
        }
        await item.deleteOne({ session });
        await this.orderModel
          .updateOne(
            { _id: order._id, status: OrderStatus.PENDING },
            { $inc: { totalAmount: -(item.unitPrice * item.quantity) } },
            { session },
          )
          .exec();
        return { deleted: true };
      });
    } finally {
      await session.endSession();
    }
  }
}
