import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/Store';
import { usePermission } from '../hooks/usePermission';
import type { PermissionAction } from '../types/permission.types';

interface Props {
  children: ReactNode;
  module: string;
  action?: PermissionAction;
}

/**
 * Protects a route by module + action permission.
 * - No token      → redirect to /admin/login
 * - No permission → redirect to /admin/403
 *
 * Usage in routes.tsx:
 *   element: <ProtectedRoute module="Events" action="read"><AdminEvents /></ProtectedRoute>
 */
export function ProtectedRoute({ children, module, action = 'read' }: Props) {
  const token = useSelector((state: RootState) => state.permission.accessToken);
  const { can } = usePermission();

  if (!token) return <Navigate to="/admin/login" replace />;
  if (!can(module, action)) return <Navigate to="/admin/403" replace />;

  return <>{children}</>;
}
