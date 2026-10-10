import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum.js';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  customerName: string;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Status must be a valid order status' })
  status?: OrderStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Total amount must be a number' })
  @Min(0, { message: 'Total amount cannot be negative' })
  totalAmount?: number;
}
