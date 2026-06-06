'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  if (isAuthRoute) return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
}
