'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
  });
}

export function useDashboardKpi() {
  return useQuery({
    queryKey: ['dashboard', 'kpi-summary'],
    queryFn: () => api.get('/dashboard/kpi-summary').then((r) => r.data),
  });
}
