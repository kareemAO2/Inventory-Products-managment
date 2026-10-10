import { ResourcePanel } from "../ResourcePanel";
import type { Entity, EntityInput } from "../../workspaceApi";

interface UsersWorkspaceProps {
  users: Entity[];
  roleOptions: { label: string; value: string }[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate: (body: EntityInput) => Promise<unknown>;
  onUpdate: (id: string, body: EntityInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function UsersWorkspace({
  users,
  roleOptions,
  canCreate,
  canUpdate,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: UsersWorkspaceProps) {
  return (
    <ResourcePanel
      title="Users"
      description="Create team accounts, assign roles, and manage access."
      items={users}
      createInModal
      createButtonLabel="Add user"
      formTitle="Create a user"
      formDescription="Add a team account and assign its role."
      fields={[
        { name: "name", label: "Full name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "password",
          label: "Temporary password",
          type: "password",
          required: true,
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: roleOptions,
        },
      ]}
      editFields={[
        { name: "name", label: "Full name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "role",
          valueName: "roleId",
          label: "Role",
          type: "select",
          required: true,
          options: roleOptions,
        },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
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
