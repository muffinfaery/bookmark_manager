'use client';

import { DashboardProvider } from '@/contexts';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
