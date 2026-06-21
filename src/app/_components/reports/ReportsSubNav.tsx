'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { recordNav } from '@/app/_constants/nav/nav';

export default function ReportsSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 border-b border-slate-200">
      <ul className="flex gap-6">
        {recordNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === '/reports' && item.href === '/reports/filtered');

          return (
            <li
              key={item.id}
              className={`border-b-2 px-1 pb-3 text-sm font-bold ${isActive ? 'border-slate-900' : 'border-transparent'}`}
            >
              <Link href={item.href} className={isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'}>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
