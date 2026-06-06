/**
 * Auth Store — Zustand
 * Gestion de l'état d'authentification côté client
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  avatar_url?: string;
  departement?: string;
}

interface AuthState {
  user: AuthUser | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AuthUser, access_token: string, refresh_token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, access_token, refresh_token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('smoe_access_token', access_token);
          localStorage.setItem('smoe_refresh_token', refresh_token);
        }
        set({ user, access_token, refresh_token, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('smoe_access_token');
          localStorage.removeItem('smoe_refresh_token');
        }
        set({ user: null, access_token: null, refresh_token: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'smoe-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ── API Client (axios) ────────────────────────────────────────
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 / refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { user, refresh_token, setAuth, logout } = useAuthStore.getState();
      if (!user?.id || !refresh_token) {
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          user_id: user.id,
          refresh_token,
        });
        setAuth(data.user, data.access_token, data.refresh_token);
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${data.access_token}`,
        };
        return apiClient(original);
      } catch {
        logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ── API helpers ────────────────────────────────────────────────
export const api = {
  get:    <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config).then(r => r.data),
  post:   <T>(url: string, data?: any) => apiClient.post<T>(url, data).then(r => r.data),
  put:    <T>(url: string, data?: any) => apiClient.put<T>(url, data).then(r => r.data),
  patch:  <T>(url: string, data?: any) => apiClient.patch<T>(url, data).then(r => r.data),
  delete: <T>(url: string) => apiClient.delete<T>(url).then(r => r.data),
};
