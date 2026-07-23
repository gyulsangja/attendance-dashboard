import {
  ReportsPeriodSelector,
  ReportsSubNav,
} from '@/app/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상세보기 | 엘엑스',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto max-w-[1800px]">
      <div>
        <h1 className="mb-3 font-bold">
          <ReportsPeriodSelector />
        </h1>
      </div>

      <ReportsSubNav />

      {children}
    </main>
  );
}
