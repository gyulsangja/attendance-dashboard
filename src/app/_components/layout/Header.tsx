'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Chip } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function Header() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <header className="fixed z-50 flex h-15 w-dvw items-center justify-between bg-white px-4 shadow-2xs">
      <Link href="/" className="flex h-full items-center">
        <Image
          src="/images/commons/logo.svg"
          alt="엘엑스 로고"
          className="w-6"
          width={91}
          height={75}
        />
        <span className="font-bold text-xl">엘엑스</span>
      </Link>

      {access.currentUser && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold">{access.currentUser.name}</p>
            <p className="text-xs text-slate-500">{access.roleLabel}</p>
          </div>
          <Chip size="small" label={access.currentUser.username} />
          <Button
            size="small"
            color="inherit"
            startIcon={<Logout />}
            onClick={() => {
              dispatch(logout());
              router.replace('/login');
            }}
          >
            로그아웃
          </Button>
        </div>
      )}
    </header>
  );
}
