import { useState, type FormEvent } from "react";
import type { Role } from "../../workspaceApi";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} from "../../workspaceApi";
import { getErrorMessage } from "../../errorMessage";

const permissionNames = [
  "user:create",
  "user:read",
  "user:update",
  "user:delete",
  "role:manage",
  "role:read",
  "category:create",
  "category:read",
  "category:update",
  "category:delete",
  "product:create",
  "product:read",
  "product:update",
  "product:delete",
  "supplier:create",
  "supplier:read",
  "supplier:update",
  "supplier:delete",
  "order:create",
  "order:read",
  "order:approve",
  "order:cancel",
  "order:ship",
  "order:delete",
  "stock:read",
  "stock:adjust",
];

export function RolesWorkspace({ roles }: { roles: Role[] }) {
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState("");

  function selectRole(role: Role) {
    setEditing(role);
    setName(role.name);
    setDescription(String(role.description ?? ""));
    setPermissions(role.permissions ?? []);
  }
  function clearForm() {
    setEditing(null);
    setName("");
    setDescription("");
    setPermissions([]);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const body = { name, description, permissions };
      if (editing) await updateRole({ id: editing._id, body }).unwrap();
      else await createRole(body).unwrap();
      clearForm();
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }
  async function remove(role: Role) {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    setError("");
    try {
      await deleteRole(role._id).unwrap();
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 className="font-bold text-slate-800">
          {editing ? `Edit ${editing.name}` : "Create a role"}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            Role name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            Description
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal"
            />
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-semibold text-slate-600">
            Permissions
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissionNames.map((permission) => (
              <label
                key={permission}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={(event) =>
                    setPermissions((current) =>
                      event.target.checked
                        ? [...current, permission]
                        : current.filter((value) => value !== permission),
                    )
                  }
                  className="accent-sky-800"
                />
                {permission}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 flex gap-2">
          <button className="rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-900">
            {editing ? "Save role" : "Create role"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {error}
          </p>
        )}
      </form>
      <div className="space-y-3">
        {roles.map((role) => (
          <article
            key={role._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800">{role.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {String(role.description ?? "No description")}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {role.permissions.length} permissions
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => selectRole(role)}
                  className="text-sm font-semibold text-sky-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(role)}
                  className="text-sm font-semibold text-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {role.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] text-sky-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

