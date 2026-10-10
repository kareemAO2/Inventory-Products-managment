import { useState, type ReactNode } from "react";
import { useAppSelector } from "../../../app/hooks";
import { getErrorMessage } from "../errorMessage";
import {
  useCreateCategoryMutation,
  useCreateProductMutation,
  useCreateSupplierMutation,
  useCreateUserMutation,
  useDeleteCategoryMutation,
  useDeleteProductMutation,
  useDeleteSupplierMutation,
  useDeleteUserMutation,
  useGetCategoriesQuery,
  useGetOrderItemsQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useGetRolesQuery,
  useGetSuppliersQuery,
  useGetUsersQuery,
  useUpdateCategoryMutation,
  useUpdateProductMutation,
  useUpdateSupplierMutation,
  useUpdateUserMutation,
} from "../workspaceApi";
import { CategoriesWorkspace } from "../components/workspaces/CategoriesWorkspace";
import { InventoryWorkspace } from "../components/workspaces/InventoryWorkspace";
import { OrdersWorkspace } from "../components/workspaces/OrdersWorkspace";
import { ProductsWorkspace } from "../components/workspaces/ProductsWorkspace";
import { RolesWorkspace } from "../components/workspaces/RolesWorkspace";
import { SuppliersWorkspace } from "../components/workspaces/SuppliersWorkspace";
import { UsersWorkspace } from "../components/workspaces/UsersWorkspace";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </h2>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      {children}
    </section>
  );
}

export function ManagementPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [activeSection, setActiveSection] = useState("");
  const permissions = user?.permissions ?? [];
  const can = (permission: string) => permissions.includes(permission);
  const productsQuery = useGetProductsQuery(undefined, {
    skip: !can("product:read"),
  });
  const categoriesQuery = useGetCategoriesQuery(undefined, {
    skip: !can("category:read"),
  });
  const suppliersQuery = useGetSuppliersQuery(undefined, {
    skip: !can("supplier:read"),
  });
  const ordersQuery = useGetOrdersQuery(undefined, {
    skip: !can("order:read"),
  });
  const itemsQuery = useGetOrderItemsQuery(undefined, {
    skip: !can("order:read"),
  });
  const usersQuery = useGetUsersQuery(undefined, { skip: !can("user:read") });
  const rolesQuery = useGetRolesQuery(undefined, { skip: !can("role:manage") });
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [operationError, setOperationError] = useState("");

  async function run<T>(operation: Promise<T>): Promise<T> {
    setOperationError("");
    try {
      return await operation;
    } catch (cause) {
      setOperationError(getErrorMessage(cause));
      throw cause;
    }
  }

  if (!user) return null;
  const categories = categoriesQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const orders = ordersQuery.data ?? [];
  const roles = rolesQuery.data ?? [];
  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role._id,
  }));
  const dataQueries = [
    ["Products", productsQuery],
    ["Categories", categoriesQuery],
    ["Suppliers", suppliersQuery],
    ["Orders", ordersQuery],
    ["Order items", itemsQuery],
    ["Users", usersQuery],
    ["Roles", rolesQuery],
  ] as const;
  const queryErrors = dataQueries.filter(([, query]) => query.isError);
  const sections = [
    ...(can("product:read") ? [{ id: "products", label: "Products" }] : []),
    ...(can("category:read")
      ? [{ id: "categories", label: "Categories" }]
      : []),
    ...(can("supplier:read") ? [{ id: "suppliers", label: "Suppliers" }] : []),
    ...(can("order:read") ? [{ id: "orders", label: "Orders" }] : []),
    ...(can("stock:read") || can("stock:adjust")
      ? [{ id: "inventory", label: "Inventory" }]
      : []),
    ...(can("user:read") ? [{ id: "users", label: "Users" }] : []),
    ...(can("role:manage")
      ? [{ id: "roles", label: "Roles & permissions" }]
      : []),
  ];
  const selectedSection = sections.some(
    (section) => section.id === activeSection,
  )
    ? activeSection
    : sections[0]?.id;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-700">
          Operations workspace
        </p>
        <h1 className="mt-1 font-manrope text-3xl font-bold tracking-tight text-slate-900">
          Management
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose a resource to view and manage the records available to your
          role.
        </p>
      </div>
      <nav
        aria-label="Management sections"
        className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-current={selectedSection === section.id ? "page" : undefined}
            onClick={() => setActiveSection(section.id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${selectedSection === section.id ? "bg-sky-800 text-white" : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"}`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {!sections.length && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No management areas are assigned to your account.
        </p>
      )}
      {queryErrors.map(([label, query]) => (
        <p
          key={String(label)}
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          Could not load {String(label).toLowerCase()}:{" "}
          {getErrorMessage(query.error)}
        </p>
      ))}
      {operationError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {operationError}
        </p>
      )}

      {selectedSection === "products" && (
        <Section title="Products">
          <ProductsWorkspace
            products={products}
            categories={categories}
            suppliers={suppliers}
            canCreate={can("product:create")}
            canUpdate={can("product:update")}
            canDelete={can("product:delete")}
            onCreate={(body) => run(createProduct(body).unwrap())}
            onUpdate={(id, body) => run(updateProduct({ id, body }).unwrap())}
            onDelete={(id) => run(deleteProduct(id).unwrap())}
          />
        </Section>
      )}

      {selectedSection === "categories" && (
        <Section title="Categories">
          <CategoriesWorkspace
            categories={categories}
            canCreate={can("category:create")}
            canUpdate={can("category:update")}
            canDelete={can("category:delete")}
            onCreate={(body) => run(createCategory(body).unwrap())}
            onUpdate={(id, body) => run(updateCategory({ id, body }).unwrap())}
            onDelete={(id) => run(deleteCategory(id).unwrap())}
          />
        </Section>
      )}

      {selectedSection === "suppliers" && (
        <Section title="Suppliers">
          <SuppliersWorkspace
            suppliers={suppliers}
            canCreate={can("supplier:create")}
            canUpdate={can("supplier:update")}
            canDelete={can("supplier:delete")}
            onCreate={(body) => run(createSupplier(body).unwrap())}
            onUpdate={(id, body) => run(updateSupplier({ id, body }).unwrap())}
            onDelete={(id) => run(deleteSupplier(id).unwrap())}
          />
        </Section>
      )}

      {selectedSection === "orders" && (
        <Section title="Orders">
          <OrdersWorkspace
            orders={orders}
            orderItems={itemsQuery.data ?? []}
            products={products}
            canCreate={can("order:create")}
            canApprove={can("order:approve")}
            canCancel={can("order:cancel")}
            canShip={can("order:ship")}
            canDelete={can("order:delete")}
          />
        </Section>
      )}

      {selectedSection === "inventory" && (
        <Section title="Inventory">
          <InventoryWorkspace
            products={products}
            canAdjust={can("stock:adjust")}
          />
        </Section>
      )}

      {selectedSection === "users" && (
        <Section title="Users">
          <UsersWorkspace
            users={usersQuery.data ?? []}
            roleOptions={roleOptions}
            canCreate={can("user:create")}
            canUpdate={can("user:update")}
            canDelete={can("user:delete")}
            onCreate={(body) => run(createUser(body).unwrap())}
            onUpdate={(id, body) => run(updateUser({ id, body }).unwrap())}
            onDelete={(id) => run(deleteUser(id).unwrap())}
          />
        </Section>
      )}

      {selectedSection === "roles" && can("role:manage") && (
        <Section title="Roles & permissions">
          <RolesWorkspace roles={roles} />
        </Section>
      )}
    </div>
  );
}
