'use client';

import { Alert } from '@mui/material';
import { FilterCode, SwitchButton } from '@/app/_components';
import FilteredAttendanceCalendar from '@/app/_components/reports/FilteredAttendanceCalendar';
import FilteredAttendanceTable from '@/app/_components/reports/FilteredAttendanceTable';
import { useFilteredAttendanceReport } from '@/app/_components/reports/hooks/useFilteredAttendanceReport';

export default function Page() {
  const report = useFilteredAttendanceReport();

  return (
    <>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <FilterCode selectedCodes={report.selectedCodes} onChange={report.setSelectedCodes} />
      </section>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">조건별 근태 이력</h2>
            <p className="mt-1 text-sm text-slate-500">
              선택한 기간과 근태코드의 발생 이력입니다.
            </p>
          </div>
          <SwitchButton value={report.viewMode} onChange={report.setViewMode} />
        </div>

        {report.isApiFallback && (
          <Alert severity="info" sx={{ mb: 2 }}>
            백엔드 출퇴근 조회 API가 아직 실제 목록을 반환하지 않아 확정된 프론트 기록을 표시합니다.
          </Alert>
        )}

        {report.viewMode === 'table' ? (
          <FilteredAttendanceTable rows={report.rows} />
        ) : (
          <FilteredAttendanceCalendar
            rows={report.rows}
            year={report.year}
            month={report.calendarMonth}
            startDate={report.startDate}
            endDate={report.endDate}
          />
        )}
      </section>
    </>
  );
}
