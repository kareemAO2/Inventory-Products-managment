export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Role & Permission Management
  ROLE_MANAGE = 'role:manage',
  ROLE_READ = 'role:read',

  // Category Management
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // Product Management
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',

  // Supplier Management
  SUPPLIER_CREATE = 'supplier:create',
  SUPPLIER_READ = 'supplier:read',
  SUPPLIER_UPDATE = 'supplier:update',
  SUPPLIER_DELETE = 'supplier:delete',

  // Order Management
  ORDER_CREATE = 'order:create',
  ORDER_READ = 'order:read',
  ORDER_APPROVE = 'order:approve',
  ORDER_CANCEL = 'order:cancel',
  ORDER_SHIP = 'order:ship',
  ORDER_DELETE = 'order:delete',

  // Stock Movement & Inventory Management
  STOCK_READ = 'stock:read',
  STOCK_ADJUST = 'stock:adjust',
}
