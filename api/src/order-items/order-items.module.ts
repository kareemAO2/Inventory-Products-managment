import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderItemsService } from './order-items.service.js';
import { OrderItemsController } from './order-items.controller.js';
import { OrderItem, OrderItemSchema } from './schemas/order-item.schema.js';
import { Order, OrderSchema } from '../orders/schemas/order.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [MongooseModule, OrderItemsService],
})
export class OrderItemsModule {}
