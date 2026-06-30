'use client';

import { useMemo } from 'react';
import { useAttendanceRecordsQuery } from '@/hooks/useAttendanceRecordQueries';
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
  selectPendingShiftCount,
  selectSelectedOperationWeek,
  selectShiftWeekConfirmed,
} from '@/selectors/managementSelectors';
import { selectOperationWeeklyReport } from '@/selectors/operationWeeklyReportSelectors';
import { useAppSelector } from '@/store/hooks';

export const useManagementOperationState = () => {
  const management = useAppSelector(selectManagementState);
  const attendanceCodes = useAppSelector(selectOperationAttendanceCodes);
  const displayedWeekSchedules = useAppSelector(selectDisplayedOperationWeekSchedules);
  const pendingShifts = useAppSelector(selectPendingShiftCount);
  const shiftWeekConfirmed = useAppSelector(selectShiftWeekConfirmed);
  const steps = useAppSelector(selectOperationSteps);
  const templateEmployees = useAppSelector(selectOperationTemplateEmployees);
  const week = useAppSelector(selectSelectedOperationWeek);
  const weekDays = useAppSelector(selectOperationWeekDays);
  const weekOptions = useAppSelector(selectOperationWeekOptions);
  const weekShiftWorkers = useAppSelector(selectOperationWeekShiftWorkers);
  const weeklyReport = useAppSelector(selectOperationWeeklyReport);
  const apiSchedulesQuery = useOperationSchedulesQuery(week.startDate, week.endDate);
  const apiRecordsQuery = useAttendanceRecordsQuery(
    buildAttendanceWeekKey(management.year, management.month, management.weekNumber),
  );
  const apiWeekRecords = useMemo(
    () => filterItemsByPeriod(apiRecordsQuery.data ?? [], week),
    [apiRecordsQuery.data, week],
  );
  const effectiveDeviceRecords = isApiDataSource
    ? apiWeekRecords
    : management.deviceRecords;
  const effectiveWeekSchedules = isApiDataSource
    ? apiSchedulesQuery.data ?? []
    : displayedWeekSchedules;
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

  return {
    ...management,
    attendanceCodes,
    deviceRecords: effectiveDeviceRecords,
    deviceRecordsApiError: isApiDataSource && apiRecordsQuery.isError,
    deviceRecordsApiLoading: isApiDataSource && apiRecordsQuery.isLoading,
    displayedWeekSchedules: effectiveWeekSchedules,
    schedulesApiError: isApiDataSource && apiSchedulesQuery.isError,
    schedulesApiLoading: isApiDataSource && apiSchedulesQuery.isLoading,
    pendingShifts,
    shiftWeekConfirmed,
    steps: effectiveSteps,
    templateEmployees,
    week,
    weekCsvUploaded: effectiveWeekCsvUploaded,
    weekDays,
    weekOptions,
    weekShiftWorkers,
    weeklyReport,
  };
};

export type ManagementOperationState = ReturnType<typeof useManagementOperationState>;

