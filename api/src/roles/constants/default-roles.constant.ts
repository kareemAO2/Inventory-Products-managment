import { Permission } from '../enums/permission.enum.js';

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: Permission[];
}

export const RoleName = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const DEFAULT_ROLES: Record<RoleName, RoleDefinition> = {
  [RoleName.ADMIN]: {
    name: RoleName.ADMIN,
    description: 'Full access to everything, including managing users, roles, and permissions',
    permissions: Object.values(Permission),
  },
  [RoleName.MANAGER]: {
    name: RoleName.MANAGER,
    description: 'Manage products, categories, suppliers; approve / cancel orders; adjust stock',
    permissions: [
      // Product management
      Permission.PRODUCT_CREATE,
      Permission.PRODUCT_READ,
      Permission.PRODUCT_UPDATE,
      Permission.PRODUCT_DELETE,

      // Category management
      Permission.CATEGORY_CREATE,
      Permission.CATEGORY_READ,
      Permission.CATEGORY_UPDATE,
      Permission.CATEGORY_DELETE,

      // Supplier management
      Permission.SUPPLIER_CREATE,
      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,
      Permission.SUPPLIER_DELETE,

      // Order management (approve / cancel, view, ship)
      Permission.ORDER_CREATE,
      Permission.ORDER_READ,
      Permission.ORDER_APPROVE,
      Permission.ORDER_CANCEL,
      Permission.ORDER_SHIP,

      // Stock adjustment
      Permission.STOCK_READ,
      Permission.STOCK_ADJUST,
    ],
  },
  [RoleName.STAFF]: {
    name: RoleName.STAFF,
    description: 'Create orders and view products; cannot delete or approve',
    permissions: [
      // View products, categories, suppliers
      Permission.PRODUCT_READ,
      Permission.CATEGORY_READ,
      Permission.SUPPLIER_READ,

      // Create and view orders (no approve, cancel, or delete)
      Permission.ORDER_CREATE,
      Permission.ORDER_READ,

      // View stock level
      Permission.STOCK_READ,
    ],
  },
};
