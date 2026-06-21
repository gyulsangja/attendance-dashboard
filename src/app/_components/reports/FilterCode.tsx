'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';

type Props = { selectedCodes: string[]; onChange: (codes: string[]) => void };

export default function FilterCode({ selectedCodes, onChange }: Props) {
  const { endDate } = useAppSelector((state) => state.reportPeriod);
  const master = useAppSelector((state) => state.attendanceCode);
  const attendanceCodes = getAttendanceCodesAtDate(master.codes, master.history, endDate);
  const all = attendanceCodes.filter((code) => code.isActive).map((code) => code.id);
  return <div>
    <p className="mb-3 text-sm font-bold text-slate-700">근태코드</p>
    <ToggleButtonGroup value={selectedCodes} onChange={(_, value: string[]) => onChange(value)} sx={{ gap: 1, flexWrap: 'wrap', '& .MuiToggleButtonGroup-grouped': { border: '1px solid #e2e8f0 !important', borderRadius: '8px !important', px: 2, py: .8, fontWeight: 700, '&.Mui-selected': { bgcolor: '#0f172a', color: 'white', '&:hover': { bgcolor: '#1e293b' } } } }}>
      <ToggleButton value="ALL" selected={selectedCodes.length === all.length} onClick={(event) => { event.preventDefault(); onChange(selectedCodes.length === all.length ? [] : all); }}>전체</ToggleButton>
      {attendanceCodes.filter((code) => code.isActive).map((code) => <ToggleButton key={code.id} value={code.id}>{code.label}</ToggleButton>)}
    </ToggleButtonGroup>
  </div>;
}
