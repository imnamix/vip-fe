import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import store from '../store/Store';
import { loadingActionHandler } from '../store/slice/Loader';
import { setAuth, setPermissions, clearAuth } from '../store/slice/PermissionSlice';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export const sessionTimeoutHandler = () => {
  store.dispatch(clearAuth());
  window.location.href = '/admin/login';
};

const ApiRequest = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Plain axios instance used only for the refresh call — no interceptors, no loops
const authAxios = axios.create({ baseURL: import.meta.env.VITE_BASE_URL });

// ─── Token refresh singleton ──────────────────────────────────────────────────
// All concurrent 401s share one refresh call; the promise is cleared when done
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const { data } = await authAxios.post('login/auth/refresh', { refreshToken });

      if (data?.success && data?.data?.accessToken) {
        const { accessToken, refreshToken: newRefresh, permissions, permissionVersion } = data.data;
        const state = store.getState().permission;

        store.dispatch(
          setAuth({
            accessToken,
            refreshToken: newRefresh ?? refreshToken,
            user: state.user!,
            permissions: permissions ?? state.permissions,
            permissionVersion: permissionVersion ?? state.permissionVersion,
          }),
        );
        return accessToken as string;
      }

      if (data?.code === 'ACCOUNT_DISABLED') {
        toast.error('Your account has been disabled. Please contact an administrator.');
      }
      return null;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

// ─── Request interceptor ──────────────────────────────────────────────────────

ApiRequest.interceptors.request.use(
  (config: RetriableConfig) => {
    store.dispatch(loadingActionHandler(true));

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const permissionVersion = localStorage.getItem('permissionVersion');
    if (permissionVersion) {
      config.headers['x-permission-version'] = permissionVersion;
    }

    return config;
  },
  (error) => {
    store.dispatch(loadingActionHandler(false));
    return Promise.reject(error);
  },
);

// ─── Response interceptor ─────────────────────────────────────────────────────

ApiRequest.interceptors.response.use(
  (response) => {
    store.dispatch(loadingActionHandler(false));
    return response;
  },
  async (error) => {
    store.dispatch(loadingActionHandler(false));

    const config = error.config as RetriableConfig;
    const status = error.response?.status;
    const code: string | undefined = error.response?.data?.code;

    // ── 409: permissions were updated server-side ─────────────────────────────
    if (status === 409 && code === 'PERMISSION_UPDATED') {
      if (config._retried) {
        return Promise.reject(error);
      }

      config._retried = true;

      const { permissions, permissionVersion } = error.response.data as {
        permissions: Record<string, any>;
        permissionVersion: string;
      };

      store.dispatch(setPermissions({ permissions, permissionVersion }));

      // Request interceptor reads fresh permissionVersion from localStorage on retry
      return ApiRequest(config);
    }

    // ── 403: check for specific backend codes ─────────────────────────────────
    if (status === 403) {
      if (code === 'ACCOUNT_DISABLED') {
        toast.error('Your account has been disabled. Please contact an administrator.');
        sessionTimeoutHandler();
        return;
      }

      toast.error(
        error.response?.data?.message || 'You do not have permission to perform this action.',
      );
      return Promise.reject(error);
    }

    // ── 401: attempt silent refresh then retry once ───────────────────────────
    if (status === 401) {
      // Don't try to refresh if this IS the refresh call
      if (config.url?.includes('auth/refresh') || config._retried) {
        sessionTimeoutHandler();
        return;
      }

      config._retried = true;

      const newToken = await refreshAccessToken();
      if (!newToken) {
        sessionTimeoutHandler();
        return;
      }

      // Patch the Authorization header for the retry
      config.headers.Authorization = `Bearer ${newToken}`;
      return ApiRequest(config);
    }

    // Network-level error (no response)
    if (!error.response) {
      sessionTimeoutHandler();
      return;
    }

    return Promise.reject(error);
  },
);

export { ApiRequest };
