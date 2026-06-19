'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { recordNav } from '@/app/_constants/nav/nav';

export default function ReportsSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-10">
      <ul className="flex">
        {recordNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === '/reports' && item.href === '/reports/filtered');

          return (
            <li
              key={item.id}
              className={`p-2 rounded-sm mr-1 ${
                isActive ? 'bg-black' : 'bg-white'
              }`}
            >
              <Link href={item.href} className={isActive ? 'text-white' : ''}>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}