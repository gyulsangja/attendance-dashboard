import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 | 엘엑스',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
