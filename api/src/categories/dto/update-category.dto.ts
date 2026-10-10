import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto.js';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
