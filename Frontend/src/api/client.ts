import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attache automatiquement le token à chaque requête
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Supprime Content-Type si le payload est un FormData pour laisser Axios/navigateur
    // définir automatiquement 'multipart/form-data; boundary=...' avec le délimiteur exact
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
  } catch {
    // pas de session stockée, requête envoyée sans token
  }
  return config;
});

// File d'attente pour éviter plusieurs appels /auth/refresh simultanés
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        let res;
        try {
          res = await apiClient.post('/api/auth/refresh', { refreshToken });
        } catch (rErr: any) {
          if (rErr.response?.status === 404) {
            res = await apiClient.post('/auth/refresh', { refreshToken });
          } else {
            throw rErr;
          }
        }
        const tokenData = res.data?.data || res.data;
        const newAccessToken = tokenData.accessToken;
        const newRefreshToken = tokenData.refreshToken || refreshToken;

        // Met à jour l'état en mémoire vive et localStorage proprement via Zustand
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        try {
          const wasLoggedIn =
            !!useAuthStore.getState().accessToken ||
            !!useAuthStore.getState().refreshToken;
          useAuthStore.getState().logout();
          if (
            wasLoggedIn &&
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login')
          ) {
            window.location.href = `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}&reason=order_auth_required`;
          }
        } catch {
          // ignore
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
