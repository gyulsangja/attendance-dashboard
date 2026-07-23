'use client';

import { Chip } from '@mui/material';
import type { OperationSchedule } from '@/types/domain';

type ScheduleEntryPreviewProps = {
  rows: OperationSchedule[];
  onDelete?: (row: OperationSchedule) => void;
};

export default function ScheduleEntryPreview({
  rows,
  onDelete,
}: ScheduleEntryPreviewProps) {
  return (
    <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
      {rows.length ? rows.map((row) => (
        <div
          key={row.employeeId + '-' + row.date + '-' + row.codeId}
          className="grid grid-cols-[1fr_1fr_120px_auto] items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0"
        >
          <div className="min-w-0">
            <strong className="block truncate">{row.name}</strong>
            <span className="block truncate text-xs text-slate-500">{row.department}</span>
          </div>
          <span className="truncate">{row.type}</span>
          <span className="text-right text-slate-500">{row.date}</span>
          {onDelete ? (
            <Chip size="small" label="삭제" variant="outlined" onDelete={() => onDelete(row)} />
          ) : <span />}
        </div>
      )) : (
        <p className="p-4 text-center text-sm text-slate-400">
          추가한 근태일정이 없습니다.
        </p>
      )}
    </div>
  );
}
