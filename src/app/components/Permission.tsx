import type { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import type { PermissionAction } from '../types/permission.types';

interface Props {
  module: string;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only when the current user has the required permission.
 *
 * Usage:
 *   <Permission module="Events" action="delete">
 *     <DeleteButton />
 *   </Permission>
 */
export function Permission({ module, action, children, fallback = null }: Props) {
  const { can } = usePermission();
  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}
