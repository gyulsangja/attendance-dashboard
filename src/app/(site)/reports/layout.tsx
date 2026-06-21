import {
  ReportsPeriodSelector,
  ReportsSummaryBox,
  ReportsSubNav
} from '@/app/_components';

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
        <ReportsSummaryBox />
      </div>

      <ReportsSubNav />

      {children}
    </main>
  );
}
