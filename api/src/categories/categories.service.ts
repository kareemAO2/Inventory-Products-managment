import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category, CategoryDocument } from './schemas/category.schema.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryModel.create(createCategoryDto);
  }

  async findAll() {
    return this.categoryModel.find({ deleted_at: null }).exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel
      .findOne({ _id: id, deleted_at: null })
      .exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        updateCategoryDto,
        { new: true },
      )
      .exec();

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }
}
