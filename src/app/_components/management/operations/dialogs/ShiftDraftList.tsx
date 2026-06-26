'use client';

import { Chip, Stack } from '@mui/material';
import type { ShiftSchedule } from '@/types/domain';

type ShiftDraftListProps = {
  drafts: ShiftSchedule[];
  onDelete: (draft: ShiftSchedule) => void;
};

export default function ShiftDraftList({
  drafts,
  onDelete,
}: ShiftDraftListProps) {
  return (
    <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-2">
      {drafts.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {drafts.map((draft) => (
            <Chip
              key={`${draft.employeeId}-${draft.date}`}
              label={`${draft.name} · ${draft.date} · ${draft.time}`}
              onDelete={() => onDelete(draft)}
            />
          ))}
        </Stack>
      ) : (
        <p className="py-6 text-center text-sm text-slate-400">
          추가한 일정이 없습니다.
        </p>
      )}
    </div>
  );
}
