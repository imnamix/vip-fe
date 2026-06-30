import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/Store';
import type { PermissionAction } from '../types/permission.types';

export function usePermission() {
  const permissions = useSelector((state: RootState) => state.permission.permissions);

  const can = useCallback(
    (module: string, action: PermissionAction): boolean => {
      return permissions[module]?.[action] === true;
    },
    [permissions],
  );

  return { can };
}
