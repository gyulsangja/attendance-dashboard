import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '직원별 상세보기 | 엘엑스',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
