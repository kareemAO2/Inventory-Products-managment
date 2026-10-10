import { Permission } from '../../roles/enums/permission.enum.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: Permission[];
  tokenType: 'access' | 'refresh';
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  permissions: Permission[];
}
