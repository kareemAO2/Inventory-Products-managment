import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StockMovementType } from '../enums/stock-movement-type.enum.js';

export class CreateStockDto {
  @IsMongoId()
  product: string;

  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  reason: string;

  @IsOptional()
  @IsMongoId()
  created_by: string;
}
