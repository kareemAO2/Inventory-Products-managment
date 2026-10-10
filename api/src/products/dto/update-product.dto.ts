import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto.js';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Product name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'SKU cannot be empty' })
  sku?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Category cannot be empty' })
  category?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Low stock threshold must be a number' })
  @Min(0, { message: 'Low stock threshold cannot be negative' })
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Supplier cannot be empty' })
  supplier?: string;

  @IsOptional()
  @IsString()
  created_by?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;
}
