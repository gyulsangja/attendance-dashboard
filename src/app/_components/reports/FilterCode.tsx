'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { getCanonicalAttendanceCode } from '@/lib/attendance/attendanceCodeCanonical';
import type { AttendanceCode } from '@/types/domain';

type Props = {
  attendanceCodes: AttendanceCode[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
};

type CodeGroup = {
  key: string;
  label: string;
  ids: string[];
};

const buildCodeGroups = (codes: AttendanceCode[]) => [
  ...codes.reduce((map, code) => {
    const canonical = getCanonicalAttendanceCode(code.id, codes, code.label);
    const ids = [...new Set([canonical.id, code.id])];
    const current = map.get(canonical.id);

    if (current) {
      current.ids = [...new Set([...current.ids, ...ids])];
      return map;
    }

    map.set(canonical.id, { key: canonical.id, label: canonical.label, ids });
    return map;
  }, new Map<string, CodeGroup>()).values(),
];

export default function FilterCode({ attendanceCodes, selectedCodes, onChange }: Props) {
  const activeCodes = attendanceCodes.filter((code) => code.isActive);
  const codeGroups = buildCodeGroups(activeCodes);
  const allCodeIds = codeGroups.flatMap((group) => group.ids);
  const isCodeGroupSelected = (group: CodeGroup) =>
    group.ids.some((id) => selectedCodes.includes(id));
  const allSelected = codeGroups.length > 0 && codeGroups.every(isCodeGroupSelected);

  const toggleCodeGroup = (group: CodeGroup) => {
    const selected = isCodeGroupSelected(group);

    onChange(selected
      ? selectedCodes.filter((id) => !group.ids.includes(id))
      : [...new Set([...selectedCodes, ...group.ids])]);
  };

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-700">근태코드</p>
      <ToggleButtonGroup
        value={selectedCodes}
        sx={{
          gap: 1,
          flexWrap: 'wrap',
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid #e2e8f0 !important',
            borderRadius: '8px !important',
            px: 2,
            py: 0.8,
            fontWeight: 700,
            '&.Mui-selected': {
              bgcolor: '#0f172a',
              color: 'white',
              '&:hover': { bgcolor: '#1e293b' },
            },
          },
        }}
      >
        <ToggleButton
          value="ALL"
          selected={allSelected}
          onClick={(event) => {
            event.preventDefault();
            onChange(allSelected ? [] : allCodeIds);
          }}
        >
          전체
        </ToggleButton>

        {codeGroups.map((group) => {
          const selected = isCodeGroupSelected(group);

          return (
            <ToggleButton
              key={group.key}
              value={group.key}
              selected={selected}
              onClick={(event) => {
                event.preventDefault();
                toggleCodeGroup(group);
              }}
            >
              {group.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </div>
  );
}
