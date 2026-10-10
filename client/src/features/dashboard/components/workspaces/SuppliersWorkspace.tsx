import { ResourcePanel } from "../ResourcePanel";
import type { Entity, EntityInput } from "../../workspaceApi";

interface SuppliersWorkspaceProps {
  suppliers: Entity[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate: (body: EntityInput) => Promise<unknown>;
  onUpdate: (id: string, body: EntityInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function SuppliersWorkspace({
  suppliers,
  canCreate,
  canUpdate,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: SuppliersWorkspaceProps) {
  return (
    <ResourcePanel
      title="Suppliers"
      description="Maintain approved supplier details."
      items={suppliers}
      fields={[
        { name: "name", label: "Supplier name", required: true },
        { name: "contactInfo", label: "Contact info", required: true },
      ]}
      columns={[
        { key: "name", label: "Supplier" },
        { key: "contactInfo", label: "Contact info" },
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
