import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Entity, Order } from "../../workspaceApi";
import { getErrorMessage } from "../../errorMessage";
import {
  useApproveOrderMutation,
  useCancelOrderMutation,
  useCreateOrderItemMutation,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useShipOrderMutation,
} from "../../workspaceApi";

function recordId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value)
    return String(value._id);
  return "";
}


function entityName(value: unknown): string {
  return value && typeof value === "object" && "name" in value
    ? String(value.name)
    : "Product";
}

export function OrdersWorkspace({
  orders,
  orderItems,
  products,
  canCreate,
  canApprove,
  canCancel,
  canShip,
  canDelete,
}: {
  orders: Order[];
  orderItems: Entity[];
  products: Entity[];
  canCreate: boolean;
  canApprove: boolean;
  canCancel: boolean;
  canShip: boolean;
  canDelete: boolean;
}) {
  const [createOrder] = useCreateOrderMutation();
  const [createItem] = useCreateOrderItemMutation();
  const [approveOrder] = useApproveOrderMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [shipOrder] = useShipOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [customerName, setCustomerName] = useState("");
  const [isAddItemsOpen, setIsAddItemsOpen] = useState(false);
  const addItemsDialog = useRef<HTMLDialogElement>(null);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = addItemsDialog.current;
    if (!dialog) return;

    if (isAddItemsOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isAddItemsOpen && dialog.open) {
      dialog.close();
    }
  }, [isAddItemsOpen]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await createOrder({ customerName }).unwrap();
      setCustomerName("");
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await createItem({
        order: selectedOrder,
        product: selectedProduct,
        quantity: Number(quantity),
      }).unwrap();
      setSelectedProduct("");
      setQuantity("1");
      setIsAddItemsOpen(false);
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }

  async function runOrderAction(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }

  return (
    <div className="space-y-5">
      {error && !isAddItemsOpen && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </p>
      )}
      {canCreate && (
        <div className="space-y-4">
          <form
            onSubmit={submitOrder}
            className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5">
              <h3 className="font-bold text-slate-800">Create an order</h3>
              <p className="mt-1 text-sm text-slate-500">
                Start a pending order for a customer.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="grid flex-1 gap-1.5 text-sm font-semibold text-slate-700">
                Customer name
                <input
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-sky-500"
                />
              </label>
              <button className="min-h-11 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white hover:bg-sky-900">
                Create order
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsAddItemsOpen(true);
            }}
            className="rounded-lg bg-sky-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-900"
          >
            Add order items
          </button>
          <dialog
            ref={addItemsDialog}
            aria-labelledby="add-order-items-title"
            onClose={() => setIsAddItemsOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsAddItemsOpen(false);
              }
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
          >
            <form onSubmit={submitItem} className="p-6 sm:p-7">
              <h3
                id="add-order-items-title"
                className="font-bold text-slate-800"
              >
                Add order items
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add products to a pending order before approval.
              </p>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                  {error}
                </p>
              )}
              <div className="mt-5 grid gap-3">
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  Pending order
                  <select
                    required
                    autoFocus
                    value={selectedOrder}
                    onChange={(event) => setSelectedOrder(event.target.value)}
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
                  >
                    <option value="">Choose an order</option>
                    {orders
                      .filter((order) => order.status === "pending")
                      .map((order) => (
                        <option key={order._id} value={order._id}>
                          {order.customerName}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  Product
                  <select
                    required
                    value={selectedProduct}
                    onChange={(event) => setSelectedProduct(event.target.value)}
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
                  >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={recordId(product)} value={recordId(product)}>
                        {String(product.name ?? "Product")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
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
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddItemsOpen(false)}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button className="min-h-11 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white hover:bg-sky-900">
                  Add item
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
      <div className="grid gap-4">
        {orders.map((order) => {
          const items = orderItems.filter(
            (item) => recordId(item.order) === order._id,
          );
          return (
            <article
              key={order._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800">
                    {order.customerName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {items.length} item{items.length === 1 ? "" : "s"} · Total $
                    {Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${order.status === "pending" ? "bg-amber-50 text-amber-800" : order.status === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                >
                  {order.status}
                </span>
                {canApprove && order.status === "pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      void runOrderAction(() =>
                        approveOrder(order._id).unwrap(),
                      )
                    }
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    Approve
                  </button>
                )}
                {canCancel && order.status === "pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      void runOrderAction(() => cancelOrder(order._id).unwrap())
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
                {canShip && order.status === "approved" && (
                  <button
                    type="button"
                    onClick={() =>
                      void runOrderAction(() => shipOrder(order._id).unwrap())
                    }
                    className="rounded-lg bg-sky-800 px-3 py-2 text-xs font-bold text-white hover:bg-sky-900"
                  >
                    Mark shipped
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      void runOrderAction(() => deleteOrder(order._id).unwrap())
                    }
                    className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                )}
              </div>
              {items.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
                  {items.map((item) => (
                    <li
                      className="flex justify-between gap-3"
                      key={recordId(item)}
                    >
                      <span>
                        {entityName(item.product)} × {String(item.quantity)}
                      </span>
                      <span>
                        $
                        {(
                          Number(item.unitPrice) * Number(item.quantity)
                        ).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
        {orders.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No orders yet.
          </p>
        )}
      </div>
    </div>
  );
}

