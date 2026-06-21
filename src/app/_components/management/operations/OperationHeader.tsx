'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';

type WeekOption = { week: number };

type OperationHeaderProps = {
  year: number;
  month: number;
  weekNumber: number;
  weekOptions: WeekOption[];
  showPeriod: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onWeekChange: (week: number) => void;
};

export default function OperationHeader({
  year,
  month,
  weekNumber,
  weekOptions,
  showPeriod,
  onYearChange,
  onMonthChange,
  onWeekChange,
}: OperationHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">운영관리</h1>
        <p className="mt-1 text-sm text-slate-500">
          주간 근태 자료를 입력하고 검토한 뒤 현황통계에 반영합니다.
        </p>
      </div>

      <Stack direction="row" spacing={1}>
        {showPeriod && (
          <>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>연도</InputLabel>
              <Select
                value={String(year)}
                label="연도"
                onChange={(event: SelectChangeEvent) =>
                  onYearChange(Number(event.target.value))
                }
              >
                {[2026, 2025, 2024].map((value) => (
                  <MenuItem key={value} value={String(value)}>
                    {value}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>월</InputLabel>
              <Select
                value={String(month)}
                label="월"
                onChange={(event: SelectChangeEvent) =>
                  onMonthChange(Number(event.target.value))
                }
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (value) => (
                    <MenuItem key={value} value={String(value)}>
                      {value}월
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>주차</InputLabel>
              <Select
                value={String(weekNumber)}
                label="주차"
                onChange={(event: SelectChangeEvent) =>
                  onWeekChange(Number(event.target.value))
                }
              >
                {weekOptions.map((item) => (
                  <MenuItem key={item.week} value={String(item.week)}>
                    {item.week}주차
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Stack>
    </div>
  );
}
