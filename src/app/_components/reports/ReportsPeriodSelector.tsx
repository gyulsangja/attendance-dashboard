'use client';

import { useMemo } from 'react';

import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { getWeeksInMonth } from '@/lib/date';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setYear,
  setMonth,
  setWeek,
} from '@/store/slices/reportPeriodSlice';

export default function ReportsPeriodSelector() {
  const dispatch = useAppDispatch();
  const { year, month, week, startDate, endDate } = useAppSelector(
    (state) => state.reportPeriod
  );

  const weekOptions = useMemo(() => {
    if (month === 'all') return [];
    return getWeeksInMonth(year, month);
  }, [year, month]);

  const handleYearChange = (event: SelectChangeEvent) => {
    dispatch(setYear(Number(event.target.value)));
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(setMonth(value === 'all' ? 'all' : Number(value)));
  };

  const handleWeekChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(setWeek(value === 'all' ? 'all' : Number(value)));
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <FormControl variant="standard">
          <Select
            value={String(year)}
            onChange={handleYearChange}
            sx={{ fontWeight: 'bold', fontSize: '1.3em' }}
          >
            <MenuItem value="2026">2026년</MenuItem>
            <MenuItem value="2025">2025년</MenuItem>
            <MenuItem value="2024">2024년</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="standard">
          <Select
            value={String(month)}
            onChange={handleMonthChange}
            sx={{ fontWeight: 'bold', fontSize: '1.3em' }}
          >
            <MenuItem value="all">전체</MenuItem>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
              <MenuItem key={item} value={String(item)}>
                {item}월
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="standard">
          <Select
            value={String(week)}
            onChange={handleWeekChange}
            disabled={month === 'all'}
            sx={{ fontWeight: 'bold', fontSize: '1.3em' }}
          >
            <MenuItem value="all">전체</MenuItem>

            {weekOptions.map((item) => (
              <MenuItem key={item.week} value={String(item.week)}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {startDate} ~ {endDate}
      </p>
    </div>
  );
}