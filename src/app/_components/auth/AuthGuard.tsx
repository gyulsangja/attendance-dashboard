'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import { useAccess } from './AccessProvider';

export const getDefaultPath = (role: string) => {
  void role;
  return '/';
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const access = useAccess();

  const allowed = pathname === '/mypage'
    || (pathname === '/' && access.canViewDashboard)
    || (pathname.startsWith('/reports') && access.canViewReports)
    || (pathname.startsWith('/management')
      && (access.canManageOperations || access.canInputShifts))
    || (pathname.startsWith('/employees') && access.canManageOrganization)
    || (pathname.startsWith('/settings') && access.canManageSettings)
    || (pathname.startsWith('/admin') && access.canManageUsers);

  useEffect(() => {
    if (!access.isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!allowed) router.replace(getDefaultPath(access.role));
  }, [access.isAuthenticated, access.role, allowed, router]);

  if (!access.isAuthenticated || !allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress size={32} />
      </div>
    );
  }

  return children;
}
