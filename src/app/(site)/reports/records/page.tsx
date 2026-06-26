'use client';

import {
  Alert,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import AttendanceRecordsTable from '@/app/_components/reports/AttendanceRecordsTable';
import { useAttendanceRecordsReport } from '@/app/_components/reports/hooks/useAttendanceRecordsReport';
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
            확정 당시의 직원 및 소속 정보를 기준으로 표시합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="small" label="퇴근/반차" sx={{ bgcolor: '#f1f5f9', color: '#475569' }} />
          <Chip size="small" label="확인 필요" sx={{ bgcolor: '#fef2f2', color: '#b91c1c' }} />
        </div>
      </div>

      {report.isApiFallback && (
        <Alert severity="info" sx={{ mb: 2 }}>
          백엔드 출퇴근 조회 API가 아직 실제 목록을 반환하지 않아 프론트 기록을 표시합니다.
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
