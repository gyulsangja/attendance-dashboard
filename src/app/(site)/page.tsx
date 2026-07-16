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
  useDashboardWeeklyExceptionalRecordsQuery,
  useDashboardWeeklyPlansQuery,
  useDashboardWeeklyQuery,
  useDashboardWeeklyShiftSchedulesQuery,
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

const mergeDashboardBlocks = ({
  stats,
  exceptionalRecords,
  plans,
  shifts,
}: {
  stats?: DashboardWeeklyDto | null;
  exceptionalRecords?: DashboardWeeklyDto | null;
  plans?: DashboardWeeklyDto | null;
  shifts?: DashboardWeeklyDto | null;
}): DashboardWeeklyDto => ({
  week_start_date: stats?.week_start_date ?? stats?.weekStartDate,
  weekStartDate: stats?.weekStartDate,
  week_end_date: stats?.week_end_date ?? stats?.weekEndDate,
  weekEndDate: stats?.weekEndDate,
  operation_confirmed: true,
  summary_cards: stats?.summary_cards ?? stats?.summaryCards ?? [],
  attendance_code_counts: stats?.attendance_code_counts ?? stats?.attendanceCodeCounts ?? [],
  exceptional_attendance_records: exceptionalRecords?.exceptional_attendance_records
    ?? exceptionalRecords?.exceptionalAttendanceRecords
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
  const statsQuery = useDashboardWeeklyQuery(year, month, selectedWeekNumber);
  const exceptionalRecordsQuery = useDashboardWeeklyExceptionalRecordsQuery(year, month, selectedWeekNumber);
  const plansQuery = useDashboardWeeklyPlansQuery(year, month, selectedWeekNumber);
  const shiftsQuery = useDashboardWeeklyShiftSchedulesQuery(year, month, selectedWeekNumber);
  const reportHref = `/reports?year=${year}&month=${month}&week=${selectedWeekNumber}`;
  const dashboardDto = useMemo(
    () => mergeDashboardBlocks({
      stats: statsQuery.data,
      exceptionalRecords: exceptionalRecordsQuery.data,
      plans: plansQuery.data,
      shifts: shiftsQuery.data,
    }),
    [exceptionalRecordsQuery.data, plansQuery.data, shiftsQuery.data, statsQuery.data],
  );
  const dashboard = useMemo(
    () => (isApiDataSource
      ? adaptDashboardWeeklyDtoToViewModel(dashboardDto, dashboardBase)
      : dashboardBase),
    [dashboardBase, dashboardDto],
  );
  const isDashboardLoading = isApiDataSource && (
    statsQuery.isLoading
    || exceptionalRecordsQuery.isLoading
    || plansQuery.isLoading
    || shiftsQuery.isLoading
  );
  const isDashboardError = isApiDataSource && (
    statsQuery.isError
    || exceptionalRecordsQuery.isError
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
          대시보드 데이터를 불러오는 중입니다.
        </Alert>
      )}

      {isDashboardError && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          대시보드 API 일부를 불러오지 못했습니다. 확인된 데이터만 표시합니다.
        </Alert>
      )}

      <DashboardWeeklySummary
        startDate={dashboard.startDate}
        endDate={dashboard.endDate}
        summaryCards={dashboard.summaryCards}
        detailAttendanceCodes={dashboard.detailAttendanceCodes}
        eventCounts={dashboard.eventCounts}
        reportHref={reportHref}
      />

      <div className="mt-5 grid gap-5 2xl:grid-cols-2">
        <DashboardEventGrid
          title="주간 근태 특이사항"
          description="출퇴근 정보에서 정상출근을 제외한 자동판정 결과를 표시합니다."
          rows={dashboard.exceptionRows}
        />
        <DashboardEventGrid
          title="주간 계획/특별 근태"
          description="운영관리 근태일정 입력에서 등록한 주간 근태 일정을 표시합니다."
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
