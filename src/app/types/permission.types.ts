export type PermissionAction = 'read' | 'write' | 'update' | 'delete';

export interface ModulePermissions {
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export type PermissionsMap = Record<string, ModulePermissions>;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roleName?: string;
  profilePicture?: string | null;
}
