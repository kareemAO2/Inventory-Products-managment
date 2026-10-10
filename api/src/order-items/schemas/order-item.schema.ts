import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Order } from '../../orders/schemas/order.schema.js';
import { Product } from '../../products/schemas/product.schema.js';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';

export type OrderItemDocument = HydratedDocument<OrderItem>;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Order.name,
    required: true,
    index: true,
  })
  order: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  deleted_at?: Date | null;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
OrderItemSchema.plugin(softDeletePlugin);
