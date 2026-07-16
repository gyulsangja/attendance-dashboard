import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '운영관리 | 엘엑스',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
