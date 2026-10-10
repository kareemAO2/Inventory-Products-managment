import { useEffect, useRef, useState, type FormEvent } from "react";
import { ResourcePanel } from "../ResourcePanel";
import type { Entity } from "../../workspaceApi";
import { getErrorMessage } from "../../errorMessage";
import {
  useAdjustStockMutation,
  useGetStockMovementsQuery,
} from "../../workspaceApi";

function recordId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value)
    return String(value._id);
  return "";
}

export function InventoryWorkspace({
  products,
  canAdjust,
}: {
  products: Entity[];
  canAdjust: boolean;
}) {
  const [adjustStock] = useAdjustStockMutation();
  const [product, setProduct] = useState("");
  const [type, setType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const adjustmentDialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const movements = useGetStockMovementsQuery();

  useEffect(() => {
    const dialog = adjustmentDialog.current;
    if (!dialog) return;

    if (isAdjustmentOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isAdjustmentOpen && dialog.open) {
      dialog.close();
    }
  }, [isAdjustmentOpen]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await adjustStock({
        product,
        type,
        quantity: Number(quantity),
        reason,
      }).unwrap();
      setQuantity("1");
      setReason("");
      setIsAdjustmentOpen(false);
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }

  const movementsError = movements.isError
    ? getErrorMessage(movements.error)
    : "";
  return (
    <div className="space-y-4">
      {movementsError && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          Could not load stock movements: {movementsError}
        </p>
      )}
      {canAdjust && (
        <>
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsAdjustmentOpen(true);
            }}
            className="rounded-lg bg-sky-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-900"
          >
            Adjust inventory
          </button>
          <dialog
            ref={adjustmentDialog}
            aria-labelledby="stock-adjustment-title"
            onClose={() => setIsAdjustmentOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsAdjustmentOpen(false);
              }
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
          >
            <form onSubmit={submit} className="p-6 sm:p-7">
              <h3
                id="stock-adjustment-title"
                className="font-bold text-slate-800"
              >
                Record a stock adjustment
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                  Product
                  <select
                    required
                    autoFocus
                    value={product}
                    onChange={(event) => setProduct(event.target.value)}
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
                  >
                    <option value="">Choose product</option>
                    {products.map((entry) => (
                      <option key={recordId(entry)} value={recordId(entry)}>
                        {String(entry.name ?? "Product")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                  Movement
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as "in" | "out")
                    }
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
                  >
                    <option value="in">Stock in</option>
                    <option value="out">Stock out</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                  Quantity
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                  Reason
                  <input
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                  {error}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentOpen(false)}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button className="min-h-11 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white hover:bg-sky-900">
                  Save adjustment
                </button>
              </div>
            </form>
          </dialog>
        </>
      )}
      <ResourcePanel
        title="Stock movements"
        description="Immutable inventory movement history."
        items={movements.data ?? []}
        fields={[]}
        columns={[
          { key: "product", label: "Product" },
          { key: "type", label: "Type" },
          { key: "quantity", label: "Quantity" },
          { key: "reason", label: "Reason" },
        ]}
      />
    </div>
  );
}
