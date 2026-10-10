import { authApi } from '../auth/authApi'

export interface Entity {
  _id: string
  id?: string
  name?: string
  [key: string]: unknown
}

export interface Product extends Entity {
  name: string
  sku: string
  price: number
  quantityInStock: number
  category: string | Entity
  supplier: string | Entity
  lowStockThreshold: number
}

export interface Order extends Entity {
  customerName: string
  status: 'pending' | 'approved' | 'shipped' | 'cancelled'
  totalAmount: number
}

export interface Role extends Entity {
  name: string
  description?: string
  permissions: string[]
}

export interface User extends Entity {
  name: string
  email: string
  role: string
  roleId: string
  permissions: string[]
  isActive: boolean
}

export interface ProductListResponse {
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type EntityInput = Record<string, string | number | boolean | string[]>

const tag = { type: 'Workspace' as const, id: 'DATA' }

export const workspaceApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, void>({
      query: () => '/products?page=1&limit=100',
      providesTags: [tag],
    }),
    getCategories: builder.query<Entity[], void>({
      query: () => '/categories',
      providesTags: [tag],
    }),
    getSuppliers: builder.query<Entity[], void>({
      query: () => '/suppliers',
      providesTags: [tag],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: [tag],
    }),
    getOrderItems: builder.query<Entity[], void>({
      query: () => '/order-items',
      providesTags: [tag],
    }),
    getStockMovements: builder.query<Entity[], void>({
      query: () => '/stock',
      providesTags: [tag],
    }),
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: [tag],
    }),
    getRoles: builder.query<Role[], void>({
      query: () => '/roles',
      providesTags: [tag],
    }),
    createProduct: builder.mutation<Product, EntityInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: EntityInput }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: [tag],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
    createCategory: builder.mutation<Entity, EntityInput>({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    updateCategory: builder.mutation<Entity, { id: string; body: EntityInput }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: [tag],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
    createSupplier: builder.mutation<Entity, EntityInput>({
      query: (body) => ({ url: '/suppliers', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    updateSupplier: builder.mutation<Entity, { id: string; body: EntityInput }>({
      query: ({ id, body }) => ({ url: `/suppliers/${id}`, method: 'PATCH', body }),
      invalidatesTags: [tag],
    }),
    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
    createOrder: builder.mutation<Order, EntityInput>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    createOrderItem: builder.mutation<Entity, EntityInput>({
      query: (body) => ({ url: '/order-items', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    approveOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: [tag],
    }),
    cancelOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: [tag],
    }),
    shipOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/ship`, method: 'PATCH' }),
      invalidatesTags: [tag],
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({ url: `/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
    adjustStock: builder.mutation<Entity, EntityInput>({
      query: (body) => ({ url: '/stock', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    createUser: builder.mutation<User, EntityInput>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    updateUser: builder.mutation<User, { id: string; body: EntityInput }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: [tag],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
    createRole: builder.mutation<Role, EntityInput>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    updateRole: builder.mutation<Role, { id: string; body: EntityInput }>({
      query: ({ id, body }) => ({ url: `/roles/${id}`, method: 'PATCH', body }),
      invalidatesTags: [tag],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useGetSuppliersQuery,
  useGetOrdersQuery,
  useGetOrderItemsQuery,
  useGetStockMovementsQuery,
  useGetUsersQuery,
  useGetRolesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useCreateOrderMutation,
  useCreateOrderItemMutation,
  useApproveOrderMutation,
  useCancelOrderMutation,
  useShipOrderMutation,
  useDeleteOrderMutation,
  useAdjustStockMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = workspaceApi
