import { IsInt, IsMongoId, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsMongoId()
  order: string;

  @IsMongoId()
  product: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
