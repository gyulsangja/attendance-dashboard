'use client';

import { useMemo, useState } from 'react';
import { Alert } from '@mui/material';
import {
  DashboardEventGrid,
  DashboardPeriodHeader,
  DashboardShiftCalendar,
  DashboardWeeklySummary,
} from '@/app/_components';
import {
  adaptDashboardWeeklyDtoToViewModel,
  type DashboardViewModel,
} from '@/adapters/dashboardAdapter';
import type { DashboardWeeklyDto } from '@/api/dto/dashboard.dto';
import {
  useDashboardWeeklyAttendanceCodeCountsQuery,
  useDashboardWeeklyExceptionalRecordsQuery,
  useDashboardWeeklyPlansQuery,
  useDashboardWeeklyShiftSchedulesQuery,
  useDashboardWeeklySummaryQuery,
} from '@/hooks/useDashboardQueries';
import { getPreviousWeekPeriod, getWeeksInMonth } from '@/lib/date';
import { getOperationWeekPeriod } from '@/lib/management/operationWeek';
import { isApiDataSource } from '@/repositories/config';
import { selectDashboardData } from '@/selectors/dashboardSelectors';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getDashboardWeekDays = (startDate: string, endDate: string) => {
  const days: DashboardViewModel['shiftCalendarDays'] = [];
  const end = new Date(`${endDate}T00:00:00`);

  for (
    const current = new Date(`${startDate}T00:00:00`);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    days.push({
      date: [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, '0'),
        String(current.getDate()).padStart(2, '0'),
      ].join('-'),
      day: current.getDate(),
      weekday: WEEKDAYS[current.getDay()],
    });
  }

  return days;
};

const buildApiDashboardBase = (
  year: number,
  month: number,
  weekNumber: number,
): DashboardViewModel => {
  const weeks = getWeeksInMonth(year, month);
  const period = getOperationWeekPeriod(year, month, weekNumber);

  return {
    weeks,
    selectedWeekNumber: period.weekNumber,
    startDate: period.startDate,
    endDate: period.endDate,
    confirmed: true,
    attendanceCodes: [],
    organizationSnapshot: {
      teams: [],
      employees: [],
    },
    weekShifts: [],
    shiftCalendarDays: getDashboardWeekDays(period.startDate, period.endDate),
    eventCounts: {},
    summaryCards: [],
    detailAttendanceCodes: [],
    shiftWorkerCount: 0,
    operationItems: [],
    vacationRows: [],
    exceptionRows: [],
    companyStatus: {
      teamCount: 0,
      employeeCount: 0,
      shiftWorkerCount: 0,
      activeAttendanceCodeCount: 0,
    },
  };
};

const mergeDashboardBlocks = (
  summary?: DashboardWeeklyDto | null,
  codeCounts?: DashboardWeeklyDto | null,
  exceptions?: DashboardWeeklyDto | null,
  plans?: DashboardWeeklyDto | null,
  shifts?: DashboardWeeklyDto | null,
): DashboardWeeklyDto => ({
  week_start_date: summary?.week_start_date ?? summary?.weekStartDate,
  weekStartDate: summary?.weekStartDate,
  week_end_date: summary?.week_end_date ?? summary?.weekEndDate,
  weekEndDate: summary?.weekEndDate,
  operation_confirmed: true,
  summary_cards: summary?.summary_cards ?? summary?.summaryCards ?? [],
  attendance_code_counts: codeCounts?.attendance_code_counts ?? codeCounts?.attendanceCodeCounts ?? [],
  exceptional_attendance_records: exceptions?.exceptional_attendance_records
    ?? exceptions?.exceptionalAttendanceRecords
    ?? [],
  weekly_attendance_plans: plans?.weekly_attendance_plans ?? plans?.weeklyAttendancePlans ?? [],
  shift_weekly_schedules: shifts?.shift_weekly_schedules ?? shifts?.shiftWeeklySchedules ?? [],
});

export default function Home() {
  const management = useAppSelector((state) => state.management);
  const attendanceCode = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const defaultPeriod = useMemo(() => getPreviousWeekPeriod(), []);
  const [year, setYear] = useState(isApiDataSource ? defaultPeriod.year : management.year);
  const [month, setMonth] = useState(isApiDataSource ? defaultPeriod.month : management.month);
  const [weekNumber, setWeekNumber] = useState(
    isApiDataSource ? defaultPeriod.weekNumber : management.weekNumber,
  );
  const apiBaseDashboard = useMemo(
    () => buildApiDashboardBase(year, month, weekNumber),
    [month, weekNumber, year],
  );
  const fallbackDashboard = useMemo<DashboardViewModel>(
    () => (
      isApiDataSource
        ? apiBaseDashboard
        : selectDashboardData({
          attendanceCode,
          management,
          organization,
        } as RootState, year, month, weekNumber)
    ),
    [apiBaseDashboard, attendanceCode, management, month, organization, weekNumber, year],
  );
  const dashboardBase = isApiDataSource ? apiBaseDashboard : fallbackDashboard;
  const selectedWeekNumber = dashboardBase.selectedWeekNumber;
  const summaryQuery = useDashboardWeeklySummaryQuery(year, month, selectedWeekNumber);
  const codeCountsQuery = useDashboardWeeklyAttendanceCodeCountsQuery(year, month, selectedWeekNumber);
  const exceptionsQuery = useDashboardWeeklyExceptionalRecordsQuery(year, month, selectedWeekNumber);
  const plansQuery = useDashboardWeeklyPlansQuery(year, month, selectedWeekNumber);
  const shiftsQuery = useDashboardWeeklyShiftSchedulesQuery(year, month, selectedWeekNumber);
  const dashboardDto = useMemo(
    () => mergeDashboardBlocks(
      summaryQuery.data,
      codeCountsQuery.data,
      exceptionsQuery.data,
      plansQuery.data,
      shiftsQuery.data,
    ),
    [codeCountsQuery.data, exceptionsQuery.data, plansQuery.data, shiftsQuery.data, summaryQuery.data],
  );
  const dashboard = useMemo(
    () => (isApiDataSource
      ? adaptDashboardWeeklyDtoToViewModel(dashboardDto, dashboardBase)
      : dashboardBase),
    [dashboardBase, dashboardDto],
  );
  const isDashboardLoading = isApiDataSource && (
    summaryQuery.isLoading
    || codeCountsQuery.isLoading
    || exceptionsQuery.isLoading
    || plansQuery.isLoading
    || shiftsQuery.isLoading
  );
  const isDashboardError = isApiDataSource && (
    summaryQuery.isError
    || codeCountsQuery.isError
    || exceptionsQuery.isError
    || plansQuery.isError
    || shiftsQuery.isError
  );

  return (
    <main className="mx-auto max-w-[1800px]">
      <DashboardPeriodHeader
        year={year}
        month={month}
        weekNumber={dashboard.selectedWeekNumber}
        weeks={dashboard.weeks}
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

      {isDashboardLoading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {'대시보드 데이터를 불러오는 중입니다.'}
        </Alert>
      )}

      {isDashboardError && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {'대시보드 API 일부를 불러오지 못했습니다. 확인된 블록만 표시합니다.'}
        </Alert>
      )}

      <DashboardWeeklySummary
        startDate={dashboard.startDate}
        endDate={dashboard.endDate}
        summaryCards={dashboard.summaryCards}
        detailAttendanceCodes={dashboard.detailAttendanceCodes}
        eventCounts={dashboard.eventCounts}
      />

      <div className="mt-5 grid gap-5 2xl:grid-cols-2">
        <DashboardEventGrid
          title={'주간 근태 특이사항'}
          description={'선택 주차의 지각, 조퇴, 결근 등 확인이 필요한 근태 이력입니다.'}
          rows={dashboard.exceptionRows}
        />
        <DashboardEventGrid
          title={'주간 계획/특별 근태'}
          description={'선택 주차의 연차, 반차, 병가, 재택근무 등 일반 근태코드입니다.'}
          rows={dashboard.vacationRows}
          showDetail={false}
        />
      </div>

      <DashboardShiftCalendar
        startDate={dashboard.startDate}
        endDate={dashboard.endDate}
        days={dashboard.shiftCalendarDays}
        shifts={dashboard.weekShifts}
      />
    </main>
  );
}
