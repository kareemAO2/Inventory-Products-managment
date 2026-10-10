import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { listProductsQuerySchema } from './dto/list-products-query.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequirePermissions(Permission.PRODUCT_CREATE)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @RequirePermissions(Permission.PRODUCT_READ)
  findAll(@Query() query: unknown) {
    return this.productsService.findAll(listProductsQuerySchema.parse(query));
  }

  @Get('low-stock')
  @RequirePermissions(Permission.STOCK_READ)
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get(':id')
  @RequirePermissions(Permission.PRODUCT_READ)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @RequirePermissions(Permission.PRODUCT_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
