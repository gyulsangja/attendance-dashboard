'use client';

import { Alert, Skeleton } from '@mui/material';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useEmployeesQuery } from '@/hooks/useEmployeeQueries';
import { useStatisticsAttendanceQuery } from '@/hooks/useStatisticsQueries';
import { isApiDataSource } from '@/repositories/config';
import {
  selectReportAttendanceCodes,
  selectReportAttendanceEventCounts,
  selectReportEmployees,
  selectReportPeriod,
} from '@/selectors/reportSelectors';
import { useAppSelector } from '@/store/hooks';

const getPeriodType = (month: 'all' | number, week: 'all' | number) => {
  if (week !== 'all') return 'WEEK';
  if (month !== 'all') return 'MONTH';
  return 'YEAR';
};

export default function ReportsSummaryBox() {
  const { year, month, week } = useAppSelector(selectReportPeriod);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const storeCounts = useAppSelector(selectReportAttendanceEventCounts);
  const storeEmployeeCount = useAppSelector(selectReportEmployees).length;
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const apiEmployeesQuery = useEmployeesQuery();
  const periodType = getPeriodType(month, week);
  const apiRecordsQuery = useStatisticsAttendanceQuery({
    periodType,
    year,
    month: month === 'all' ? undefined : month,
    week: week === 'all' ? undefined : week,
  });

  const attendanceCodes = isApiDataSource
    ? apiAttendanceCodesQuery.data ?? []
    : storeAttendanceCodes;
  const records = apiRecordsQuery.data ?? [];
  const counts = isApiDataSource
    ? records.flatMap((record) => record.events).reduce<Record<string, number>>((result, event) => {
      result[event.codeId] = (result[event.codeId] ?? 0) + 1;
      return result;
    }, {})
    : storeCounts;
  const employeeCount = isApiDataSource
    ? apiEmployeesQuery.data?.length ?? 0
    : storeEmployeeCount;
  const isLoading = isApiDataSource && (
    apiAttendanceCodesQuery.isLoading
    || apiRecordsQuery.isLoading
    || apiEmployeesQuery.isLoading
  );
  const isError = isApiDataSource && (
    apiAttendanceCodesQuery.isError
    || apiRecordsQuery.isError
    || apiEmployeesQuery.isError
  );

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          상세보기 요약 데이터를 불러오지 못했습니다.
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: 6 }, (_item, index) => (
            <Skeleton key={index} variant="rounded" height={96} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {attendanceCodes.filter((code) => code.isActive).map((code) => (
            <div key={code.id} className="rounded-lg bg-slate-50 px-4 py-4">
              <p className="whitespace-nowrap text-sm font-semibold text-slate-500">{code.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">
                {counts[code.id] ?? 0}
                <span className="ml-1 text-sm font-medium text-slate-400">건</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-right text-sm text-slate-500">
        등록 직원 <strong className="text-slate-800">{employeeCount}명</strong>
      </p>
    </section>
  );
}
