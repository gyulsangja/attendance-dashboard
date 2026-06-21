'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';
type ViewMode = 'table' | 'calendar';
type Props = { value?: ViewMode; onChange?: (value: ViewMode) => void };

export default function SwitchButton({ value = 'table', onChange }: Props) {
  return <ToggleButtonGroup size="small" value={value} exclusive onChange={(_, next) => next && onChange?.(next)}>
    <ToggleButton value="table" sx={{ px: 2, fontWeight: 700, '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff' } }}>목록</ToggleButton>
    <ToggleButton value="calendar" sx={{ px: 2, fontWeight: 700, '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff' } }}>달력</ToggleButton>
  </ToggleButtonGroup>;
}
