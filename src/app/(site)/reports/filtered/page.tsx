'use client';

import { useEffect, useRef } from 'react';
import { Alert } from '@mui/material';
import { FilterCode, SwitchButton } from '@/app/_components';
import {
  FilteredAttendanceCalendar,
  FilteredAttendanceTable,
  useFilteredAttendanceReport,
} from '@/app/_components';
import { useAppDispatch } from '@/store/hooks';
import { setMonth, setWeek, setYear } from '@/store/slices/reportPeriodSlice';

const toPositiveNumber = (value: string | null) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

export default function Page() {
  const dispatch = useAppDispatch();
  const appliedQueryRef = useRef('');
  const report = useFilteredAttendanceReport();
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const year = toPositiveNumber(searchParams.get('year'));
    const month = toPositiveNumber(searchParams.get('month'));
    const week = toPositiveNumber(searchParams.get('week'));
    const queryKey = `${year ?? ''}-${month ?? ''}-${week ?? ''}`;

    if (!year || !month || !week || appliedQueryRef.current === queryKey) return;

    appliedQueryRef.current = queryKey;
    dispatch(setYear(year));
    dispatch(setMonth(month));
    dispatch(setWeek(week));
  }, [dispatch]);

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
            근태코드를 불러오지 못했습니다.
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
            근태 기록을 불러오지 못했습니다.
          </Alert>
        )}

        {report.viewMode === 'table' ? (
          <FilteredAttendanceTable rows={report.rows} />
        ) : (
          <>
            {report.isYearPeriod && (
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap gap-2">
                  {monthOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => report.setSelectedCalendarMonth(value)}
                      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                        report.calendarMonth === value
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {value}월
                    </button>
                  ))}
                </div>
              </div>
            )}
            <FilteredAttendanceCalendar
              rows={report.rows}
              year={report.year}
              month={report.calendarMonth}
              startDate={report.calendarStartDate}
              endDate={report.calendarEndDate}
            />
          </>
        )}
      </section>
    </>
  );
}
