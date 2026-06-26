'use client';

import type { ScheduleEntryEmployee } from '@/app/_components/management/operations/hooks/useScheduleEntryDrafts';

type ScheduleEntryPreviewProps = {
  rows: Array<{
    employee: ScheduleEntryEmployee;
    date: string;
  }>;
  codeLabel?: string;
};

export default function ScheduleEntryPreview({
  rows,
  codeLabel,
}: ScheduleEntryPreviewProps) {
  return (
    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
      {rows.length ? rows.map(({ employee, date }) => (
        <div
          key={`${employee.id}-${date}`}
          className="grid grid-cols-[1fr_1fr_120px] border-b px-3 py-2 text-sm"
        >
          <strong>{employee.name}</strong>
          <span>{codeLabel ?? '근태 미선택'}</span>
          <span className="text-right text-slate-500">{date}</span>
        </div>
      )) : (
        <p className="p-4 text-center text-sm text-slate-400">
          직원과 날짜를 선택해주세요.
        </p>
      )}
    </div>
  );
}
