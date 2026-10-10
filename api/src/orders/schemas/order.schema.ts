import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum.js';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    index: true,
  })
  status: OrderStatus;

  @Prop({ required: true, default: 0, min: 0 })
  totalAmount: number;

  deleted_at?: Date | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(softDeletePlugin);
