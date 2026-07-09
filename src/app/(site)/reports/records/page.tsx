'use client';

import {
  Alert,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { AttendanceRecordsTable, useAttendanceRecordsReport } from '@/app/_components';
import { getYearOptions } from '@/lib/date';

export default function Page() {
  const report = useAttendanceRecordsReport();
  const yearOptions = getYearOptions(report.year);

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">출퇴근기록</h2>
            <div className="flex flex-wrap gap-2">
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel>연도</InputLabel>
                <Select
                  label="연도"
                  value={String(report.year)}
                  onChange={(event) => report.handleYearChange(Number(event.target.value))}
                >
                  {yearOptions.map((value) => (
                    <MenuItem key={value} value={value}>{value}년</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 96 }}>
                <InputLabel>월</InputLabel>
                <Select
                  label="월"
                  value={String(report.displayMonth)}
                  onChange={(event) => report.setMonth(Number(event.target.value))}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                    <MenuItem key={value} value={value}>{value}월</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            선택한 연도와 월 기준으로 직원별 출퇴근 시간을 조회합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="small" label="퇴근/반차" sx={{ bgcolor: '#f1f5f9', color: '#475569' }} />
          <Chip size="small" label="확인 필요" sx={{ bgcolor: '#fef2f2', color: '#b91c1c' }} />
        </div>
      </div>

      {report.isApiEmpty && (
        <Alert severity="info" sx={{ mb: 2 }}>
          선택한 월에 조회된 출퇴근 기록이 없습니다.
        </Alert>
      )}
      {report.isApiError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          월간 출퇴근 기록 조회 API를 불러오지 못했습니다.
        </Alert>
      )}
      {report.isApiLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          월간 출퇴근 기록 데이터를 불러오는 중입니다.
        </Alert>
      )}

      <AttendanceRecordsTable
        days={report.days}
        employees={report.employees}
        getCell={report.getCell}
      />

      <p className="mt-3 text-xs text-slate-400">
        표를 좌우로 스크롤하면 전체 기록을 확인할 수 있습니다.
      </p>
    </section>
  );
}
