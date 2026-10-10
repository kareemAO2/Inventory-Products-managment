import { ResourcePanel, type ResourceField } from "../ResourcePanel";
import type { Entity, EntityInput } from "../../workspaceApi";

interface ProductsWorkspaceProps {
  products: Entity[];
  categories: Entity[];
  suppliers: Entity[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate: (body: EntityInput) => Promise<unknown>;
  onUpdate: (id: string, body: EntityInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

function recordId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value)
    return String(value._id);
  return "";
}

export function ProductsWorkspace({
  products,
  categories,
  suppliers,
  canCreate,
  canUpdate,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: ProductsWorkspaceProps) {
  const fields: ResourceField[] = [
    { name: "name", label: "Product name", required: true },
    { name: "sku", label: "SKU", required: true },
    { name: "price", label: "Price", type: "number", required: true },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: categories.map((entry) => ({
        label: String(entry.name ?? ""),
        value: recordId(entry),
      })),
    },
    {
      name: "supplier",
      label: "Supplier",
      type: "select",
      required: true,
      options: suppliers.map((entry) => ({
        label: String(entry.name ?? ""),
        value: recordId(entry),
      })),
    },
    { name: "lowStockThreshold", label: "Low-stock threshold", type: "number" },
  ];

  return (
    <ResourcePanel
      title="Products"
      description="Catalog and current inventory levels."
      items={products}
      createInModal
      createButtonLabel="Add product"
      fields={fields}
      columns={[
        { key: "name", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "price", label: "Price" },
        { key: "quantityInStock", label: "In stock" },
        { key: "category", label: "Category" },
        { key: "supplier", label: "Supplier" },
      ]}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
}
