import type { Metadata } from 'next';
import Providers from '@/providers';

import './globals.css';

export const metadata: Metadata = {
  title: '엘엑스: 출퇴근 관리 시스템',
  description: '엘엑스: 출퇴근 관리 시스템',
  icons: {
    icon: '/images/commons/logo.svg',
    shortcut: '/images/commons/logo.svg',
    apple: '/images/commons/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
