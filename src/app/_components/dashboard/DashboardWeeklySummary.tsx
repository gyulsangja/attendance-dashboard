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
};

export default function DashboardWeeklySummary({
  startDate,
  endDate,
  summaryCards,
  detailAttendanceCodes,
  eventCounts,
}: DashboardWeeklySummaryProps) {
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">주간 근태 요약</h2>
          <p className="mt-1 text-sm text-slate-500">
            {startDate} ~ {endDate} 출퇴근 기록과 근태코드 발생 건수입니다.
          </p>
        </div>
        <Button component={Link} href="/reports" size="small">
          상세보기
        </Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{item.value}건</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600">근태코드별 발생</p>
      <p className="mt-1 text-xs text-slate-400">
        상단 특이근태를 제외한 근태코드 발생 건수를 코드별로 집계합니다.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        {detailAttendanceCodes.map((code) => (
          <div key={code.id} className="rounded-lg border border-slate-100 px-3 py-3">
            <span className="truncate text-sm font-semibold text-slate-500">
              {code.label}
            </span>
            <p className="mt-1 text-lg font-bold">{eventCounts[code.id] ?? 0}건</p>
          </div>
        ))}
      </div>
    </section>
  );
}
