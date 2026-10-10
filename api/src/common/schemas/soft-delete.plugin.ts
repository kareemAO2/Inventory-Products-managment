import type { Schema } from 'mongoose';

interface SoftDeleteQuery {
  getOptions(): { withDeleted?: boolean };
  where(filter: { deleted_at: null }): unknown;
}

function excludeSoftDeleted(this: SoftDeleteQuery): void {
  const options = this.getOptions();
  if (options.withDeleted) {
    delete options.withDeleted;
    return;
  }
  this.where({ deleted_at: null });
}

export function softDeletePlugin(schema: Schema): void {
  schema.add({
    deleted_at: { type: Date, default: null, index: true },
  });
  schema.pre(/^find/, excludeSoftDeleted);
  schema.pre('countDocuments', excludeSoftDeleted);
  schema.pre('updateOne', excludeSoftDeleted);
  schema.pre('updateMany', excludeSoftDeleted);
}
