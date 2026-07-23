'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import type { AttendanceCode } from '@/types/domain';

type SummaryCard = {
  label: string;
  value: number;
};

type DashboardWeeklySummaryProps = {
  startDate: string;
  endDate: string;
  summaryCards: SummaryCard[];
  detailAttendanceCodes: AttendanceCode[];
  eventCounts: Record<string, number>;
  reportHref: string;
};

const groupStyleByLabel: Record<string, string> = {
  '출근 기록': 'border-sky-200 bg-sky-50 text-sky-900',
  '이상 근태': 'border-rose-200 bg-rose-50 text-rose-900',
  '휴가/반차': 'border-emerald-200 bg-emerald-50 text-emerald-900',
};

const groupDescriptionByLabel: Record<string, string> = {
  '출근 기록': '출입통제데이터 기준',
  '이상 근태': '지각, 결근 합계',
  '휴가/반차': '연차, 오전반차, 오후반차 합계',
};

export default function DashboardWeeklySummary({
  startDate,
  endDate,
  summaryCards,
  detailAttendanceCodes,
  eventCounts,
  reportHref,
}: DashboardWeeklySummaryProps) {
  const sortedDetailCodes = [...detailAttendanceCodes].sort((a, b) =>
    (eventCounts[b.id] ?? 0) - (eventCounts[a.id] ?? 0) || a.label.localeCompare(b.label, 'ko'));

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">주간 근태 요약</h2>
          <p className="mt-1 text-sm text-slate-500">
            {startDate} ~ {endDate} 기준 주요 근태 통계입니다.
          </p>
        </div>
        <Button component={Link} href={reportHref} size="small">
          상세보기
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {summaryCards.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border px-5 py-4 ${groupStyleByLabel[item.label] ?? 'border-slate-200 bg-slate-50 text-slate-900'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold opacity-75">{item.label}</p>
                <p className="mt-1 text-xs font-medium opacity-60">
                  {groupDescriptionByLabel[item.label] ?? '선택 주차 기준'}
                </p>
              </div>
              <p className="text-3xl font-bold leading-none">
                {item.value.toLocaleString('ko-KR')}
                <span className="ml-1 text-sm font-semibold opacity-70">건</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">세부 근태</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {sortedDetailCodes.length}개 항목
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {sortedDetailCodes.length > 0 ? sortedDetailCodes.map((code) => (
            <div
              key={code.id}
              className="flex min-w-[120px] items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
            >
              <span className="truncate font-semibold text-slate-600">{code.label}</span>
              <strong className="shrink-0 text-slate-900">
                {(eventCounts[code.id] ?? 0).toLocaleString('ko-KR')}건
              </strong>
            </div>
          )) : (
            <p className="text-sm text-slate-500">표시할 세부 근태가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}
