import { z } from 'zod';

const sortableProductFields = ['name', 'sku', 'price', 'createdAt'] as const;

export const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z
      .string()
      .regex(/^-?(name|sku|price|createdAt)$/, 'Unsupported sort field')
      .optional(),
    category: z
      .string()
      .regex(/^[\da-f]{24}$/i, 'Category must be a valid ID')
      .optional(),
    minPrice: z.coerce.number().finite().min(0).optional(),
    q: z.string().trim().min(1).optional(),
  })
  .strict();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type SortableProductField = (typeof sortableProductFields)[number];
