'use client';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getYearOptions } from '@/lib/date';

type Props = {
  year: number;
  month: number;
  weekNumber: number;
  weeks: { week: number; label: string; startDate: string; endDate: string }[];
  onYearChange: (value: number) => void;
  onMonthChange: (value: number) => void;
  onWeekChange: (value: number) => void;
};

export default function DashboardPeriodHeader({
  year,
  month,
  weekNumber,
  weeks,
  onYearChange,
  onMonthChange,
  onWeekChange,
}: Props) {
  const selectedWeek = weeks.find((week) => week.week === weekNumber) ?? weeks[0];
  const yearOptions = getYearOptions(year);

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="mt-2 text-sm text-slate-500">
          {selectedWeek?.startDate} ~ {selectedWeek?.endDate} 기준 주간 근태 현황입니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>연도</InputLabel>
          <Select
            label="연도"
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
          >
            {yearOptions.map((item) => (
              <MenuItem key={item} value={item}>{item}년</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>월</InputLabel>
          <Select
            label="월"
            value={month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
              <MenuItem key={item} value={item}>{item}월</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>주차</InputLabel>
          <Select
            label="주차"
            value={weekNumber}
            onChange={(event) => onWeekChange(Number(event.target.value))}
          >
            {weeks.map((week) => (
              <MenuItem key={week.week} value={week.week}>{week.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
}
