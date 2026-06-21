'use client';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

type Props = {
  year: number;
  month: number;
  weekNumber: number;
  weeks: { week: number; label: string; startDate: string; endDate: string }[];
  confirmed: boolean;
  onYearChange: (value: number) => void;
  onMonthChange: (value: number) => void;
  onWeekChange: (value: number) => void;
};

export default function DashboardPeriodHeader({
  year,
  month,
  weekNumber,
  weeks,
  confirmed,
  onYearChange,
  onMonthChange,
  onWeekChange,
}: Props) {
  const selectedWeek = weeks.find((week) => week.week === weekNumber) ?? weeks[0];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">경영 대시보드</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            confirmed
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {confirmed ? '현황통계 반영 완료' : '운영관리 진행 중'}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {selectedWeek?.startDate} ~ {selectedWeek?.endDate} 기준 전사 현황입니다.
        </p>
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>연도</InputLabel>
          <Select
            label="연도"
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
          >
            {[2025, 2026, 2027].map((item) => (
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
