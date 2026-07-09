'use client';

import { Alert } from '@mui/material';
import { FilterCode, SwitchButton } from '@/app/_components';
import {
  FilteredAttendanceCalendar,
  FilteredAttendanceTable,
  useFilteredAttendanceReport,
} from '@/app/_components';

export default function Page() {
  const report = useFilteredAttendanceReport();

  return (
    <>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        {report.isCodeLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            근태코드를 불러오는 중입니다.
          </Alert>
        )}
        {report.isCodeError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            근태코드 API를 불러오지 못했습니다.
          </Alert>
        )}
        <FilterCode
          attendanceCodes={report.attendanceCodes}
          selectedCodes={report.selectedCodes}
          onChange={report.setSelectedCodes}
        />
      </section>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">조건별 근태 이력</h2>
            <p className="mt-1 text-sm text-slate-500">
              선택한 기간과 근태코드 기준으로 발생 이력을 조회합니다.
            </p>
          </div>
          <SwitchButton value={report.viewMode} onChange={report.setViewMode} />
        </div>

        {report.isApiEmpty && (
          <Alert severity="info" sx={{ mb: 2 }}>
            선택한 기간에 조회된 근태 기록이 없습니다.
          </Alert>
        )}
        {report.isApiError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            근태 기록 조회 API를 불러오지 못했습니다.
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
