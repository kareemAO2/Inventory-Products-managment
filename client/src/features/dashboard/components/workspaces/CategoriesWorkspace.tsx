import { ResourcePanel } from "../ResourcePanel";
import type { Entity, EntityInput } from "../../workspaceApi";

interface CategoriesWorkspaceProps {
  categories: Entity[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate: (body: EntityInput) => Promise<unknown>;
  onUpdate: (id: string, body: EntityInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function CategoriesWorkspace({
  categories,
  canCreate,
  canUpdate,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: CategoriesWorkspaceProps) {
  return (
    <ResourcePanel
      title="Categories"
      description="Manage the product category list."
      items={categories}
      fields={[
        { name: "name", label: "Category name", required: true },
        { name: "description", label: "Description", required: true },
      ]}
      columns={[
        { key: "name", label: "Category" },
        { key: "description", label: "Description" },
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
