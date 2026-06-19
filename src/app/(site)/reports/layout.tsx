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
    <>
      <div>
        <h1 className="font-bold mb-3">
          <ReportsPeriodSelector />
        </h1>
        <ReportsSummaryBox />
      </div>

      <ReportsSubNav />

      {children}
    </>
  );
}