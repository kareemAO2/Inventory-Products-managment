import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty({ message: 'Supplier name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Contact info is required' })
  contactInfo: string;
}
