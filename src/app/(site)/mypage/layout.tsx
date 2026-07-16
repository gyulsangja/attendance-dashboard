import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '마이페이지 | 엘엑스',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
