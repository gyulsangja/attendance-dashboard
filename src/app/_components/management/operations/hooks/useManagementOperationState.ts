'use client';

import { useMemo } from 'react';
import {
  adaptAttendManagerConfirmStatus,
  adaptAttendManagerShiftDtoToSchedule,
  adaptAttendManagerSummary,
} from '@/adapters/attendManagerAdapter';
import { adaptWeeklyReportDtoToOperationReport } from '@/adapters/weeklyReportAdapter';
import {
  useAttendManagerOperationConfirmStatusQuery,
  useAttendManagerShiftMonthWeeksQuery,
  useAttendManagerSummaryQuery,
} from '@/hooks/useAttendManagerQueries';
import { useAttendanceRecordsQuery } from '@/hooks/useAttendanceRecordQueries';
import { useOrganizationEmployeesQuery } from '@/hooks/useEmployeeQueries';
import { useOperationSchedulesQuery } from '@/hooks/useOperationScheduleQueries';
import { buildAttendanceWeekKey } from '@/lib/attendance/attendancePeriodKey';
import { useWeeklyReportQuery } from '@/hooks/useReportQueries';
import { filterItemsByPeriod } from '@/lib/management/operationWeek';
import { isApiDataSource } from '@/repositories/config';
import {
  selectDisplayedOperationWeekSchedules,
  selectManagementState,
  selectOperationAttendanceCodes,
  selectOperationSteps,
  selectOperationTemplateEmployees,
  selectOperationWeekDays,
  selectOperationWeekOptions,
  selectOperationWeekShiftWorkers,
  selectSelectedOperationWeek,
} from '@/selectors/managementSelectors';
import {
  selectOperationWeeklyReport,
  type OperationWeeklyReport,
} from '@/selectors/operationWeeklyReportSelectors';
import { useAppSelector } from '@/store/hooks';

const buildEmptyWeeklyReport = (
  week: { label: string; startDate: string; endDate: string },
  weekDays: Array<{ date: string; label: string }>,
): OperationWeeklyReport => ({
  title: `${week.label} 주간 근태 보고`,
  periodLabel: `${week.startDate} ~ ${week.endDate}`,
  generatedAt: new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date()),
  codeCounts: [],
  timeColumns: weekDays.map((day) => ({
    date: day.date,
    label: day.label,
  })),
  timeRows: [],
});

const getApiEmployeeSelectId = (employee: { id: number; employeeNo?: string }) => {
  const employeeNo = Number(employee.employeeNo);
  return Number.isFinite(employeeNo) && employeeNo > 0 ? employeeNo : employee.id;
};


export const useManagementOperationState = () => {
  const management = useAppSelector(selectManagementState);
  const attendanceCodes = useAppSelector(selectOperationAttendanceCodes);
  const displayedWeekSchedules = useAppSelector(selectDisplayedOperationWeekSchedules);
  const steps = useAppSelector(selectOperationSteps);
  const templateEmployees = useAppSelector(selectOperationTemplateEmployees);
  const week = useAppSelector(selectSelectedOperationWeek);
  const weekDays = useAppSelector(selectOperationWeekDays);
  const weekOptions = useAppSelector(selectOperationWeekOptions);
  const weekShiftWorkers = useAppSelector(selectOperationWeekShiftWorkers);
  const fallbackWeeklyReport = useAppSelector((state) => (
    isApiDataSource ? null : selectOperationWeeklyReport(state)
  ));
  const apiSummaryQuery = useAttendManagerSummaryQuery(
    management.year,
    management.month,
    management.weekNumber,
    false,
  );
  const apiOperationConfirmStatusQuery = useAttendManagerOperationConfirmStatusQuery(
    management.year,
    management.month,
    management.weekNumber,
    false,
  );
  const apiShiftMonthQuery = useAttendManagerShiftMonthWeeksQuery(
    management.year,
    management.month,
    weekOptions,
    isApiDataSource,
  );
  const apiWeeklyReportQuery = useWeeklyReportQuery(
    management.year,
    management.month,
    management.weekNumber,
    false,
  );
  const apiOrganizationEmployeesQuery = useOrganizationEmployeesQuery();
  const apiSchedulesQuery = useOperationSchedulesQuery(
    week.startDate,
    week.endDate,
    {
      year: management.year,
      month: management.month,
      week: management.weekNumber,
    },
  );
  const apiRecordsQuery = useAttendanceRecordsQuery(
    buildAttendanceWeekKey(management.year, management.month, management.weekNumber),
  );
  const apiWeekRecords = useMemo(
    () => filterItemsByPeriod(apiRecordsQuery.data ?? [], week),
    [apiRecordsQuery.data, week],
  );
  const apiSummary = useMemo(
    () => adaptAttendManagerSummary(apiSummaryQuery.data),
    [apiSummaryQuery.data],
  );
  const apiMonthShifts = useMemo(() => {
    const schedules = (apiShiftMonthQuery.data ?? []).map(adaptAttendManagerShiftDtoToSchedule);
    return [...new Map(schedules.map((item) => [item.id, item])).values()];
  }, [apiShiftMonthQuery.data]);
  const effectiveConfirmed = isApiDataSource
    ? (
      apiSummary?.operationConfirmed
      ?? adaptAttendManagerConfirmStatus(
        apiOperationConfirmStatusQuery.data,
        false,
      )
    )
    : management.confirmed;
  const effectiveDeviceRecords = isApiDataSource
    ? apiWeekRecords
    : management.deviceRecords;
  const effectiveWeekSchedules = isApiDataSource
    ? apiSchedulesQuery.data ?? []
    : displayedWeekSchedules;
  const effectiveShifts = isApiDataSource
    ? apiMonthShifts
    : management.shifts;
  const effectiveWeekShifts = filterItemsByPeriod(effectiveShifts, week);
  const effectiveWeekShiftWorkers = isApiDataSource
    ? (apiOrganizationEmployeesQuery.data ?? [])
      .filter((employee) => employee.shiftWorker)
      .map((employee) => ({
        employeeId: getApiEmployeeSelectId(employee),
        employeeNo: employee.employeeNo,
        name: employee.name,
      }))
    : weekShiftWorkers;
  const effectiveTemplateEmployees = isApiDataSource
    ? (apiOrganizationEmployeesQuery.data ?? []).map((employee) => ({
      employeeId: getApiEmployeeSelectId(employee),
      employeeName: employee.name,
      department: employee.backendDeptName ?? employee.backendDeptCode ?? '-',
      position: employee.backendRankName ?? employee.backendRankCode ?? employee.position,
      shiftWorker: employee.shiftWorker,
    }))
    : templateEmployees;
  const effectiveWeekTerminalRecords = filterItemsByPeriod(effectiveDeviceRecords, week)
    .filter((item) => Boolean(item.checkIn || item.checkOut));
  const effectiveWeekCsvUploaded = effectiveWeekTerminalRecords.length > 0;
  const effectiveSteps = steps.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        value: `${effectiveWeekSchedules.length}건 등록`,
        done: true,
      };
    }
    if (index !== 1) return step;
    return {
      ...step,
      value: effectiveWeekCsvUploaded
        ? `${effectiveWeekTerminalRecords.length}건 확인`
        : '업로드 필요',
      done: effectiveWeekCsvUploaded,
    };
  });
  const summaryScheduleCount = apiSummary?.attendanceScheduleCount ?? effectiveWeekSchedules.length;
  const summaryDeviceRecordCount = apiSummary?.deviceRecordCount ?? effectiveWeekTerminalRecords.length;
  const summarySteps = effectiveSteps.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        value: `${summaryScheduleCount}건 등록`,
        done: summaryScheduleCount > 0,
      };
    }
    if (index === 1) {
      return {
        ...step,
        value: summaryDeviceRecordCount > 0
          ? `${summaryDeviceRecordCount}건 확인`
          : '업로드 필요',
        done: summaryDeviceRecordCount > 0,
      };
    }
    if (index === 2) {
      const shiftValue = effectiveWeekShifts.length === 0
        ? '일정 없음'
        : `${effectiveWeekShifts.length}건 등록`;
      return {
        ...step,
        value: shiftValue,
        done: true,
      };
    }
    if (index === 3) {
      return {
        ...step,
        value: effectiveConfirmed ? '최종 확정' : '확정 전',
        done: effectiveConfirmed,
      };
    }
    return step;
  });
  const weeklyReport = isApiDataSource
    ? adaptWeeklyReportDtoToOperationReport(
      apiWeeklyReportQuery.data,
      buildEmptyWeeklyReport(week, weekDays),
    )
    : fallbackWeeklyReport ?? buildEmptyWeeklyReport(week, weekDays);

  return {
    ...management,
    attendanceCodes,
    attendManagerApiError: isApiDataSource && (
      apiSummaryQuery.isError ||
      apiOperationConfirmStatusQuery.isError ||
      apiShiftMonthQuery.isError ||
      apiWeeklyReportQuery.isError ||
      apiOrganizationEmployeesQuery.isError
    ),
    attendManagerApiLoading: isApiDataSource && (
      apiSummaryQuery.isLoading ||
      apiOperationConfirmStatusQuery.isLoading ||
      apiShiftMonthQuery.isLoading ||
      apiWeeklyReportQuery.isLoading ||
      apiOrganizationEmployeesQuery.isLoading
    ),
    confirmed: effectiveConfirmed,
    deviceRecords: effectiveDeviceRecords,
    deviceRecordsApiError: isApiDataSource && apiRecordsQuery.isError,
    deviceRecordsApiLoading: isApiDataSource && apiRecordsQuery.isLoading,
    displayedWeekSchedules: effectiveWeekSchedules,
    schedulesApiError: isApiDataSource && apiSchedulesQuery.isError,
    schedulesApiLoading: isApiDataSource && apiSchedulesQuery.isLoading,
    shifts: effectiveShifts,
    steps: summarySteps,
    templateEmployees: effectiveTemplateEmployees,
    week,
    weekCsvUploaded: effectiveWeekCsvUploaded,
    weekDays,
    weekOptions,
    weekShiftWorkers: effectiveWeekShiftWorkers,
    weeklyReport,
  };
};

export type ManagementOperationState = ReturnType<typeof useManagementOperationState>;




