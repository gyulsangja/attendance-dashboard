'use client';

import { useMemo } from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { getWeeksInMonth } from '@/lib/date';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMonth, setWeek, setYear } from '@/store/slices/reportPeriodSlice';

export default function ReportsPeriodSelector() {
  const dispatch = useAppDispatch();
  const { year, month, week, startDate, endDate } = useAppSelector((state) => state.reportPeriod);
  const weeks = useMemo(() => month === 'all' ? [] : getWeeksInMonth(year, month), [year, month]);
  const selectStyle = { fontWeight: 700, fontSize: 20, '&:before': { borderBottom: 0 } };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-2xl font-bold">근태 현황</span>
        <FormControl variant="standard"><Select value={String(year)} sx={selectStyle} onChange={(e: SelectChangeEvent) => dispatch(setYear(Number(e.target.value)))}>
          {[2026, 2025, 2024].map((value) => <MenuItem key={value} value={value}>{value}년</MenuItem>)}
        </Select></FormControl>
        <FormControl variant="standard"><Select value={String(month)} sx={selectStyle} onChange={(e: SelectChangeEvent) => dispatch(setMonth(e.target.value === 'all' ? 'all' : Number(e.target.value)))}>
          <MenuItem value="all">전체</MenuItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((value) => <MenuItem key={value} value={value}>{value}월</MenuItem>)}
        </Select></FormControl>
        <FormControl variant="standard"><Select value={String(week)} disabled={month === 'all'} sx={selectStyle} onChange={(e: SelectChangeEvent) => dispatch(setWeek(e.target.value === 'all' ? 'all' : Number(e.target.value)))}>
          <MenuItem value="all">전체</MenuItem>
          {weeks.map((value) => <MenuItem key={value.week} value={value.week}>{value.label}</MenuItem>)}
        </Select></FormControl>
      </div>
      <p className="mt-2 text-sm font-normal text-slate-500">조회 기간 · {startDate} ~ {endDate}</p>
    </div>
  );
}
