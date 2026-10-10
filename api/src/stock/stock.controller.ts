import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StockService } from './stock.service.js';
import { CreateStockDto } from './dto/create-stock.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @RequirePermissions(Permission.STOCK_ADJUST)
  @Post()
  create(
    @Body() createStockDto: CreateStockDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.stockService.create({
      product: createStockDto.product,
      type: createStockDto.type,
      quantity: createStockDto.quantity,
      reason: createStockDto.reason,
      created_by: userId,
    });
  }

  @RequirePermissions(Permission.STOCK_READ)
  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @RequirePermissions(Permission.STOCK_READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @RequirePermissions(Permission.STOCK_ADJUST)
  @Patch(':id')
  update(@Param('id') id: string): never {
    return this.stockService.update(id);
  }

  @RequirePermissions(Permission.STOCK_ADJUST)
  @Delete(':id')
  remove(@Param('id') id: string): never {
    return this.stockService.remove(id);
  }
}
