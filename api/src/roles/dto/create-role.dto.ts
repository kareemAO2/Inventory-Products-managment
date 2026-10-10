import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Permission } from '../enums/permission.enum.js';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsEnum(Permission, {
    each: true,
    message: 'Each permission must be a valid permission',
  })
  permissions: Permission[];
}
