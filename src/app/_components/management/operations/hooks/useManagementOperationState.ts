'use client';

import { useMemo } from 'react';
import {
  adaptAttendManagerConfirmStatus,
  adaptAttendManagerShiftDtoToSchedule,
  adaptAttendManagerSummary,
  getAttendManagerConfirmStatusSuccessCount,
} from '@/adapters/attendManagerAdapter';
import {
  useAttendManagerOperationConfirmStatusQuery,
  useAttendManagerOperationConfirmStatusListQuery,
  useAttendManagerShiftMonthWeeksQuery,
  useAttendManagerSummaryQuery,
} from '@/hooks/useAttendManagerQueries';
import { useAttendanceRecordsQuery } from '@/hooks/useAttendanceRecordQueries';
import { useOrganizationEmployeesQuery } from '@/hooks/useEmployeeQueries';
import { useOperationSchedulesQuery } from '@/hooks/useOperationScheduleQueries';
import { buildAttendanceWeekKey } from '@/lib/attendance/attendancePeriodKey';
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
  type OperationWeeklyReportTimeCell,
  type OperationWeeklyReport,
} from '@/selectors/operationWeeklyReportSelectors';
import { useAppSelector } from '@/store/hooks';
import type { AttendanceCode, AttendanceRecord, OperationSchedule } from '@/types/domain';

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

const getCodeLabel = (
  codeId: string,
  attendanceCodes: AttendanceCode[],
  fallback?: string,
) => attendanceCodes.find((code) => code.id === codeId)?.label
  ?? fallback
  ?? codeId;

const getRecordCodeLabels = (
  record: AttendanceRecord | undefined,
  attendanceCodes: AttendanceCode[],
) => record?.events.map((event) => getCodeLabel(
  event.codeId,
  attendanceCodes,
  event.detail && event.detail !== event.codeId ? event.detail : undefined,
)) ?? [];

const buildWeeklyReportFromOperationData = ({
  attendanceCodes,
  records,
  schedules,
  templateEmployees,
  week,
  weekDays,
}: {
  attendanceCodes: AttendanceCode[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  templateEmployees: Array<{
    employeeId: number;
    employeeName: string;
    department: string;
    position?: string;
    shiftWorker?: boolean;
  }>;
  week: { label: string; startDate: string; endDate: string };
  weekDays: Array<{ date: string; label: string }>;
}): OperationWeeklyReport => {
  const countMap = new Map<string, { count: number; label?: string }>();
  const addCodeCount = (codeId: string, label?: string) => {
    if (!codeId) return;
    const current = countMap.get(codeId);
    countMap.set(codeId, {
      count: (current?.count ?? 0) + 1,
      label: current?.label ?? label,
    });
  };

  records.forEach((record) => {
    record.events.forEach((event) => {
      addCodeCount(
        event.codeId,
        event.detail && event.detail !== event.codeId ? event.detail : undefined,
      );
    });
  });
  schedules.forEach((schedule) => {
    addCodeCount(schedule.codeId, schedule.type);
  });

  const employeeMap = new Map<number, {
    employeeId: number;
    employeeName: string;
    department: string;
  }>();

  templateEmployees.forEach((employee) => {
    employeeMap.set(employee.employeeId, {
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      department: employee.department,
    });
  });
  records.forEach((record) => {
    if (employeeMap.has(record.employeeId)) return;
    employeeMap.set(record.employeeId, {
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      department: record.department,
    });
  });
  schedules.forEach((schedule) => {
    if (employeeMap.has(schedule.employeeId)) return;
    employeeMap.set(schedule.employeeId, {
      employeeId: schedule.employeeId,
      employeeName: schedule.name,
      department: schedule.department,
    });
  });

  const timeRows = [...employeeMap.values()]
    .sort((a, b) =>
      a.department.localeCompare(b.department, 'ko')
      || a.employeeName.localeCompare(b.employeeName, 'ko'))
    .map((employee) => {
      const cells = weekDays.reduce<Record<string, OperationWeeklyReportTimeCell>>((result, day) => {
        const record = records.find(
          (item) => item.employeeId === employee.employeeId && item.date === day.date,
        );
        const daySchedules = schedules.filter(
          (item) => item.employeeId === employee.employeeId && item.date === day.date,
        );
        const codeLabels = [
          ...getRecordCodeLabels(record, attendanceCodes),
          ...daySchedules.map((schedule) => getCodeLabel(schedule.codeId, attendanceCodes, schedule.type)),
        ];

        result[day.date] = {
          time: record && (record.checkIn || record.checkOut)
            ? `${record.checkIn ?? '-'} / ${record.checkOut ?? '-'}`
            : '-',
          codes: [...new Set(codeLabels.filter(Boolean))].join(', '),
        };
        return result;
      }, {});

      return {
        employeeId: employee.employeeId,
        department: employee.department,
        employeeName: employee.employeeName,
        cells,
      };
    });

  return {
    title: `${week.label} 주간 근태 보고`,
    periodLabel: `${week.startDate} ~ ${week.endDate}`,
    generatedAt: new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date()),
    codeCounts: [...countMap.entries()]
      .map(([codeId, summary]) => {
        const code = attendanceCodes.find((item) => item.id === codeId);
        return {
          codeId,
          label: code?.label ?? summary.label ?? codeId,
          count: summary.count,
          exceptional: code?.isExceptional ?? false,
        };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ko')),
    timeColumns: weekDays.map((day) => ({
      date: day.date,
      label: day.label,
    })),
    timeRows,
  };
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
    isApiDataSource,
  );
  const apiOperationConfirmStatusQuery = useAttendManagerOperationConfirmStatusQuery(
    management.year,
    management.month,
    management.weekNumber,
    isApiDataSource,
  );
  const apiOperationConfirmStatusListQuery = useAttendManagerOperationConfirmStatusListQuery(
    management.year,
    management.month,
    isApiDataSource,
  );
  const apiShiftMonthQuery = useAttendManagerShiftMonthWeeksQuery(
    management.year,
    management.month,
    weekOptions,
    isApiDataSource,
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
    () => apiRecordsQuery.data ?? [],
    [apiRecordsQuery.data],
  );
  const apiSummary = useMemo(
    () => adaptAttendManagerSummary(apiSummaryQuery.data),
    [apiSummaryQuery.data],
  );
  const apiCurrentWeekConfirmStatus = useMemo(
    () => (apiOperationConfirmStatusListQuery.data ?? []).find((item) =>
      String(item.year) === String(management.year)
      && String(item.month) === String(management.month)
      && String(item.week) === String(management.weekNumber)),
    [
      apiOperationConfirmStatusListQuery.data,
      management.month,
      management.weekNumber,
      management.year,
    ],
  );
  const apiOperationConfirmed = useMemo(
    () => (
      apiOperationConfirmStatusQuery.data
        ? adaptAttendManagerConfirmStatus(apiOperationConfirmStatusQuery.data, false)
        : apiCurrentWeekConfirmStatus
          ? adaptAttendManagerConfirmStatus(apiCurrentWeekConfirmStatus, false)
        : undefined
    ),
    [apiCurrentWeekConfirmStatus, apiOperationConfirmStatusQuery.data],
  );
  const apiMonthShifts = useMemo(() => {
    const schedules = (apiShiftMonthQuery.data ?? []).map(adaptAttendManagerShiftDtoToSchedule);
    return [...new Map(schedules.map((item) => [item.id, item])).values()];
  }, [apiShiftMonthQuery.data]);
  const effectiveConfirmed = isApiDataSource
    ? (
      apiOperationConfirmed
      ?? apiSummary?.operationConfirmed
      ?? false
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
  const effectiveWeekTerminalRecords = (isApiDataSource
    ? effectiveDeviceRecords
    : filterItemsByPeriod(effectiveDeviceRecords, week))
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
  const statusListDeviceRecordCount = getAttendManagerConfirmStatusSuccessCount(apiCurrentWeekConfirmStatus);
  const summaryDeviceRecordCount = apiSummary?.deviceRecordCount
    ?? (statusListDeviceRecordCount > 0 ? statusListDeviceRecordCount : effectiveWeekTerminalRecords.length);
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
    ? buildWeeklyReportFromOperationData({
      attendanceCodes,
      records: effectiveWeekTerminalRecords,
      schedules: effectiveWeekSchedules,
      templateEmployees: effectiveTemplateEmployees,
      week,
      weekDays,
    })
    : fallbackWeeklyReport ?? buildEmptyWeeklyReport(week, weekDays);

  return {
    ...management,
    attendanceCodes,
    attendManagerApiError: isApiDataSource && (
      apiSummaryQuery.isError ||
      apiOperationConfirmStatusQuery.isError ||
      apiOperationConfirmStatusListQuery.isError ||
      apiShiftMonthQuery.isError ||
      apiOrganizationEmployeesQuery.isError
    ),
    attendManagerApiLoading: isApiDataSource && (
      apiSummaryQuery.isLoading ||
      apiOperationConfirmStatusQuery.isLoading ||
      apiOperationConfirmStatusListQuery.isLoading ||
      apiShiftMonthQuery.isLoading ||
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




