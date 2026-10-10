import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema.js';
import { Model } from 'mongoose';
import type {
  ListProductsQuery,
  SortableProductField,
} from './dto/list-products-query.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const oldProduct = await this.productModel
      .findOne({ sku: createProductDto.sku })
      .exec();
    if (oldProduct) {
      throw new ConflictException('Product already exist');
    }
    return this.productModel.create(createProductDto);
  }

  async findAll(query: ListProductsQuery) {
    const escapedSearch = query.q?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const search = escapedSearch ? new RegExp(escapedSearch, 'i') : undefined;
    const filter = {
      deleted_at: null,
      ...(query.category ? { category: query.category } : {}),
      ...(query.minPrice !== undefined
        ? { price: { $gte: query.minPrice } }
        : {}),
      ...(search ? { $or: [{ name: search }, { sku: search }] } : {}),
    };

    const sort: Partial<Record<SortableProductField, 1 | -1>> = {};
    if (query.sort) {
      const descending = query.sort.startsWith('-');
      const field = (
        descending ? query.sort.slice(1) : query.sort
      ) as SortableProductField;
      sort[field] = descending ? -1 : 1;
    }

    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category')
        .populate('supplier')
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findLowStock() {
    return this.productModel
      .find({
        deleted_at: null,
        $expr: { $lt: ['$quantityInStock', '$lowStockThreshold'] },
      })
      .exec();
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findOne({ _id: id, deleted_at: null })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with this ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        updateProductDto,
        { new: true },
      )
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with this ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string) {
    const removedProduct = await this.productModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .exec();
    if (!removedProduct) {
      throw new NotFoundException(`Product with this ID ${id} not found`);
    }
    return removedProduct;
  }
}
