import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, PermissionsMap } from '../../types/permission.types';

interface PermissionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  permissions: PermissionsMap;
  permissionVersion: string | null;
}

function loadFromStorage(): PermissionState {
  try {
    return {
      accessToken: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
      permissions: JSON.parse(localStorage.getItem('permissions') || '{}'),
      permissionVersion: localStorage.getItem('permissionVersion'),
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      permissions: {},
      permissionVersion: null,
    };
  }
}

const permissionSlice = createSlice({
  name: 'permission',
  initialState: loadFromStorage,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
        permissions: PermissionsMap;
        permissionVersion: string | null;
      }>,
    ) {
      const { accessToken, refreshToken, user, permissions, permissionVersion } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.permissions = permissions;
      state.permissionVersion = permissionVersion;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      if (permissionVersion) localStorage.setItem('permissionVersion', permissionVersion);
    },

    setPermissions(
      state,
      action: PayloadAction<{
        permissions: PermissionsMap;
        permissionVersion: string | null;
      }>,
    ) {
      state.permissions = action.payload.permissions;
      state.permissionVersion = action.payload.permissionVersion;

      localStorage.setItem('permissions', JSON.stringify(action.payload.permissions));
      if (action.payload.permissionVersion) {
        localStorage.setItem('permissionVersion', action.payload.permissionVersion);
      }
    },

    clearAuth(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.permissions = {};
      state.permissionVersion = null;

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('permissionVersion');
    },
  },
});

export const { setAuth, setPermissions, clearAuth } = permissionSlice.actions;
export default permissionSlice.reducer;
