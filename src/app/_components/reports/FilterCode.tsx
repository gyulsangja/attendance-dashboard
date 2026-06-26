'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { selectReportAttendanceCodes } from '@/selectors/reportSelectors';
import { useAppSelector } from '@/store/hooks';

type Props = {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
};

export default function FilterCode({ selectedCodes, onChange }: Props) {
  const attendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const activeCodes = attendanceCodes.filter((code) => code.isActive);
  const allCodeIds = activeCodes.map((code) => code.id);
  const allSelected = selectedCodes.length === allCodeIds.length;

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-700">근태코드</p>
      <ToggleButtonGroup
        value={selectedCodes}
        onChange={(_, value: string[]) => onChange(value.filter((item) => item !== 'ALL'))}
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
        {activeCodes.map((code) => (
          <ToggleButton key={code.id} value={code.id}>
            {code.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}
