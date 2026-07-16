'use client';

import { Alert, Skeleton } from '@mui/material';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
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

const formatCount = (value: number, unit: string) => `${value.toLocaleString('ko-KR')}${unit}`;

export default function ReportsSummaryBox() {
  const { year, month, week, startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const storeCounts = useAppSelector(selectReportAttendanceEventCounts);
  const storeEmployeeCount = useAppSelector(selectReportEmployees).length;
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
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
  const records = (apiRecordsQuery.data ?? []).filter((record) =>
    record.date >= startDate && record.date <= endDate);
  const periodEmployeeCount = new Set(
    records.map((record) => `${record.employeeId}|${record.department}|${record.position}`),
  ).size;
  const counts = isApiDataSource
    ? records.flatMap((record) => record.events).reduce<Record<string, number>>((result, event) => {
      result[event.codeId] = (result[event.codeId] ?? 0) + 1;
      return result;
    }, {})
    : storeCounts;
  const employeeCount = isApiDataSource
    ? periodEmployeeCount
    : storeEmployeeCount;
  const activeCodes = attendanceCodes
    .filter((code) => code.isActive)
    .map((code) => ({
      ...code,
      count: counts[code.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ko'));
  const occurredCodes = activeCodes.filter((code) => code.count > 0);
  const totalCount = activeCodes.reduce((sum, code) => sum + code.count, 0);
  const topCode = occurredCodes[0];
  const summaryItems = [
    {
      label: '총 발생',
      value: formatCount(totalCount, '건'),
      helper: '선택 기간 전체 근태코드 발생',
    },
    {
      label: '조회 직원',
      value: formatCount(employeeCount, '명'),
      helper: '기간 내 근태 기록 기준',
    },
    {
      label: '발생 코드',
      value: formatCount(occurredCodes.length, '개'),
      helper: `전체 활성 코드 ${activeCodes.length.toLocaleString('ko-KR')}개 중`,
    },
    {
      label: '최다 발생',
      value: topCode?.label ?? '-',
      helper: topCode ? formatCount(topCode.count, '건') : '발생 없음',
    },
  ];
  const isLoading = isApiDataSource && (
    apiAttendanceCodesQuery.isLoading
    || apiRecordsQuery.isLoading
  );
  const isError = isApiDataSource && (
    apiAttendanceCodesQuery.isError
    || apiRecordsQuery.isError
  );

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          상세보기 요약 데이터를 불러오지 못했습니다.
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={104} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">조회 기간 요약</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">근태 발생 현황</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {startDate} ~ {endDate}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <p className="mt-2 truncate text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{item.helper}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
