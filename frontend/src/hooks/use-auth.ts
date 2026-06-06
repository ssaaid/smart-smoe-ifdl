'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api.post('/auth/login', credentials).then((r) => r.data),
    onSuccess: (data) => {
      localStorage.setItem('smoe_access_token', data.access_token);
      localStorage.setItem('smoe_refresh_token', data.refresh_token);
      setAuth(data.user, data.access_token, data.refresh_token);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();

  return async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors
    } finally {
      localStorage.removeItem('smoe_access_token');
      localStorage.removeItem('smoe_refresh_token');
      logout();
      router.push('/login');
    }
  };
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
    enabled: isAuthenticated,
  });
}
