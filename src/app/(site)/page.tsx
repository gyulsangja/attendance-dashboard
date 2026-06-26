'use client';

import { useMemo, useState } from 'react';
import { Alert } from '@mui/material';
import DashboardCompanyStatus from '@/app/_components/dashboard/DashboardCompanyStatus';
import DashboardEventGrid from '@/app/_components/dashboard/DashboardEventGrid';
import DashboardOperationStatus from '@/app/_components/dashboard/DashboardOperationStatus';
import DashboardPeriodHeader from '@/app/_components/dashboard/DashboardPeriodHeader';
import DashboardShiftCalendar from '@/app/_components/dashboard/DashboardShiftCalendar';
import DashboardWeeklySummary from '@/app/_components/dashboard/DashboardWeeklySummary';
import { selectDashboardData } from '@/selectors/dashboardSelectors';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

export default function Home() {
  const management = useAppSelector((state) => state.management);
  const attendanceCode = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const [year, setYear] = useState(management.year);
  const [month, setMonth] = useState(management.month);
  const [weekNumber, setWeekNumber] = useState(management.weekNumber);
  const dashboard = useMemo(
    () => selectDashboardData({
      attendanceCode,
      management,
      organization,
    } as RootState, year, month, weekNumber),
    [attendanceCode, management, month, organization, weekNumber, year],
  );

  const statusOverview = (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <DashboardOperationStatus items={dashboard.operationItems} />
      <DashboardCompanyStatus
        teamCount={dashboard.organizationSnapshot.teams.length}
        employeeCount={dashboard.organizationSnapshot.employees.length}
        shiftWorkerCount={dashboard.shiftWorkerCount}
        attendanceCodes={dashboard.attendanceCodes}
      />
    </div>
  );

  return (
    <main className="mx-auto max-w-[1800px]">
      <DashboardPeriodHeader
        year={year}
        month={month}
        weekNumber={dashboard.selectedWeekNumber}
        weeks={dashboard.weeks}
        confirmed={dashboard.confirmed}
        onYearChange={(value) => {
          setYear(value);
          setWeekNumber(1);
        }}
        onMonthChange={(value) => {
          setMonth(value);
          setWeekNumber(1);
        }}
        onWeekChange={setWeekNumber}
      />

      {!dashboard.confirmed && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          선택한 주차는 운영관리 확정 전입니다. 확정 전에는 주간 근태 요약과 특이사항을 표시하지 않습니다.
        </Alert>
      )}

      {!dashboard.confirmed && statusOverview}

      {dashboard.confirmed && (
        <>
          <DashboardWeeklySummary
            startDate={dashboard.startDate}
            endDate={dashboard.endDate}
            summaryCards={dashboard.summaryCards}
            detailAttendanceCodes={dashboard.detailAttendanceCodes}
            eventCounts={dashboard.eventCounts}
          />

          <div className="mt-5 grid gap-5 2xl:grid-cols-2">
            <DashboardEventGrid
              title="주간 근태 특이사항"
              description="선택 주차의 지각, 조퇴, 결근 등 확인이 필요한 확정 이력입니다."
              rows={dashboard.exceptionRows}
            />
            <DashboardEventGrid
              title="주간 계획/특별 근태"
              description="선택 주차에 입력된 연차, 반차, 병가, 재택근무 등 일반 근태코드입니다."
              rows={dashboard.vacationRows}
              showDetail={false}
            />
          </div>
        </>
      )}

      <DashboardShiftCalendar
        startDate={dashboard.startDate}
        endDate={dashboard.endDate}
        days={dashboard.shiftCalendarDays}
        shifts={dashboard.weekShifts}
      />

      {dashboard.confirmed && statusOverview}
    </main>
  );
}
