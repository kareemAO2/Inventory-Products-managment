import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { Order, OrderSchema } from './schemas/order.schema.js';
import {
  OrderItem,
  OrderItemSchema,
} from '../order-items/schemas/order-item.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import {
  StockMovement,
  StockMovementSchema,
} from '../stock/schemas/stock-movement.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: Product.name, schema: ProductSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [MongooseModule, OrdersService],
})
export class OrdersModule {}
