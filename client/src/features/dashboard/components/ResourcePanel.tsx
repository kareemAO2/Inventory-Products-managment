import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Entity, EntityInput } from "../workspaceApi";
import { getErrorMessage } from "../errorMessage";

export interface ResourceField {
  name: string;
  valueName?: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "select";
  required?: boolean;
  options?: { label: string; value: string }[];
}

interface ResourcePanelProps {
  title: string;
  description: string;
  items: Entity[];
  fields: ResourceField[];
  editFields?: ResourceField[];
  formTitle?: string;
  formDescription?: string;
  createInModal?: boolean;
  createButtonLabel?: string;
  columns: { key: string; label: string }[];
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCreate?: (body: EntityInput) => Promise<unknown>;
  onUpdate?: (id: string, body: EntityInput) => Promise<unknown>;
  onDelete?: (id: string) => Promise<unknown>;
}

function valueFor(item: Entity, key: string): string {
  const value = item[key];
  if (value && typeof value === "object" && "name" in value) {
    return String(value.name);
  }
  if (value && typeof value === "object" && "_id" in value) {
    return String(value._id);
  }
  return value == null ? "" : String(value);
}

function fieldValueFor(item: Entity, field: ResourceField): string {
  const value = item[field.valueName ?? field.name];
  if (
    field.type === "select" &&
    value &&
    typeof value === "object" &&
    "_id" in value
  ) {
    return String(value._id);
  }
  return valueFor(item, field.valueName ?? field.name);
}

function entityId(item: Entity): string {
  return item._id ?? item.id ?? "";
}

function toInput(
  values: Record<string, string>,
  fields: ResourceField[],
): EntityInput {
  return Object.fromEntries(
    fields
      .filter(
        (field) =>
          values[field.name] !== undefined &&
          !(
            field.type === "number" &&
            !field.required &&
            values[field.name] === ""
          ),
      )
      .map((field) => [
        field.name,
        field.type === "number"
          ? Number(values[field.name])
          : values[field.name],
      ]),
  );
}

export function ResourcePanel({
  title,
  description,
  items,
  fields,
  editFields,
  formTitle,
  formDescription,
  createInModal = false,
  createButtonLabel,
  columns,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  onCreate,
  onUpdate,
  onDelete,
}: ResourcePanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const createDialog = useRef<HTMLDialogElement>(null);
  const activeFields = editingId && editFields ? editFields : fields;

  useEffect(() => {
    const dialog = createDialog.current;
    if (!dialog) return;

    if (isCreateOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isCreateOpen && dialog.open) {
      dialog.close();
    }
  }, [isCreateOpen]);

  function beginEdit(item: Entity) {
    setEditingId(entityId(item));
    setValues(
      Object.fromEntries(
        (editFields ?? fields).map((field) => [
          field.name,
          fieldValueFor(item, field),
        ]),
      ),
    );
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setValues({});
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = toInput(values, activeFields);
      if (editingId && onUpdate) {
        await onUpdate(editingId, body);
      } else if (onCreate) {
        await onCreate(body);
      }
      resetForm();
      if (createInModal && !editingId) setIsCreateOpen(false);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (
      !onDelete ||
      !window.confirm(`Delete this ${title.toLowerCase()} record?`)
    ) {
      return;
    }
    setError("");
    try {
      await onDelete(id);
    } catch (cause) {
      setError(getErrorMessage(cause, "The record could not be deleted."));
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {createInModal && canCreate && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsCreateOpen(true);
              }}
              className="rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-900"
            >
              {createButtonLabel ?? `Add ${title}`}
            </button>
          )}
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
            {items.length} records
          </span>
        </div>
      </div>

      {error && !isCreateOpen && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800"
        >
          {error}
        </p>
      )}

      {((canCreate && !createInModal) || (editingId && canUpdate)) && (
        <form
          className={`mb-5 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 ${formTitle ? "rounded-2xl border border-sky-200 bg-white shadow-sm" : "rounded-xl bg-slate-50"}`}
          onSubmit={submit}
        >
          {formTitle && !editingId && (
            <div className="sm:col-span-2 lg:col-span-3">
              <h3 className="font-bold text-slate-800">{formTitle}</h3>
              {formDescription && (
                <p className="mt-1 text-sm text-slate-500">
                  {formDescription}
                </p>
              )}
            </div>
          )}
          {(editingId ? activeFields : fields).map((field) => (
            <label
              key={field.name}
              className="grid gap-1 text-xs font-semibold text-slate-600"
            >
              {field.label}
              {field.type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-sky-500"
                >
                  <option value="">Choose {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required={field.required}
                  type={field.type ?? "text"}
                  min={field.type === "number" ? 0 : undefined}
                  step={field.type === "number" ? "any" : undefined}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-sky-500"
                />
              )}
            </label>
          ))}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : `Add ${title}`}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {createInModal && canCreate && (
        <dialog
          ref={createDialog}
          aria-labelledby="resource-create-title"
          onClose={() => setIsCreateOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateOpen(false);
            }
          }}
          className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
        >
          <form
            onSubmit={submit}
            className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7"
          >
            <div className="sm:col-span-2">
              <h3 id="resource-create-title" className="font-bold text-slate-800">
                {formTitle ?? `Add ${title}`}
              </h3>
              {formDescription && (
                <p className="mt-1 text-sm text-slate-500">
                  {formDescription}
                </p>
              )}
            </div>
            {fields.map((field) => (
              <label
                key={field.name}
                className="grid gap-1 text-xs font-semibold text-slate-600"
              >
                {field.label}
                {field.type === "select" ? (
                  <select
                    required={field.required}
                    autoFocus={field === fields[0]}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-sky-500"
                  >
                    <option value="">
                      Choose {field.label.toLowerCase()}
                    </option>
                    {field.options?.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required={field.required}
                    type={field.type ?? "text"}
                    min={field.type === "number" ? 0 : undefined}
                    step={field.type === "number" ? "any" : undefined}
                    autoFocus={field === fields[0]}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-sky-500"
                  />
                )}
              </label>
            ))}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:col-span-2"
              >
                {error}
              </p>
            )}
            <div className="flex items-end justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(false);
                }}
                className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-10 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60"
              >
                {saving ? "Saving…" : `Add ${title}`}
              </button>
            </div>
          </form>
        </dialog>
      )}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          Nothing to show yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                {columns.map((column) => (
                  <th className="px-3 py-2 font-semibold" key={column.key}>
                    {column.label}
                  </th>
                ))}
                {(canUpdate || canDelete) && (
                  <th className="px-3 py-2 font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const id = entityId(item);
                return (
                  <tr
                    className="border-b border-slate-100 last:border-0"
                    key={id}
                  >
                    {columns.map((column) => (
                      <td
                        className="max-w-64 truncate px-3 py-3 text-slate-700"
                        key={column.key}
                      >
                        {valueFor(item, column.key) || "—"}
                      </td>
                    ))}
                    {(canUpdate || canDelete) && (
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => beginEdit(item)}
                              className="font-semibold text-sky-800 hover:text-sky-950"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void remove(id)}
                              className="font-semibold text-rose-700 hover:text-rose-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
