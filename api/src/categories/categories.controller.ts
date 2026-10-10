import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions(Permission.CATEGORY_CREATE)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @RequirePermissions(Permission.CATEGORY_READ)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.CATEGORY_READ)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.CATEGORY_UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.CATEGORY_DELETE)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
