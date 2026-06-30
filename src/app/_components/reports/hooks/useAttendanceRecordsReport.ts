'use client';

import { useMemo } from 'react';
import { useAttendanceRecordsQuery } from '@/hooks/useAttendanceRecordQueries';
import { buildAttendanceMonthKey } from '@/lib/attendance/attendancePeriodKey';
import { getKoreanPublicHoliday } from '@/lib/date';
import { isApiDataSource } from '@/repositories/config';
import {
  selectReportAttendanceCodes,
  selectReportOrganizationSnapshot,
  selectReportPeriod,
  selectReportRecords,
} from '@/selectors/reportSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMonth, setYear } from '@/store/slices/reportPeriodSlice';
import {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { AttendanceRecord, ReportEmployee } from '@/types/domain';

export type AttendanceCellStatus = 'normal' | 'late' | 'leave' | 'holiday' | 'warning';
export type AttendanceCellValue = {
  top: string;
  bottom?: string;
  status: AttendanceCellStatus;
};
export type AttendanceReportEmployee = ReportEmployee & { shiftWorker: boolean };
export type AttendanceRecordDay = {
  day: number;
  date: string;
  weekday: number;
  holiday: ReturnType<typeof getKoreanPublicHoliday>;
};

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const attendanceCellStyles: Record<AttendanceCellStatus, string> = {
  normal: 'bg-white text-slate-700',
  late: 'bg-white text-slate-700',
  leave: 'bg-slate-100 text-slate-700',
  holiday: 'bg-slate-50 text-slate-400',
  warning: 'bg-white text-slate-700',
};

const hasAnyCode = (record: AttendanceRecord, codeIds: string[]) =>
  record.events.some((event) => codeIds.includes(event.codeId));

export function useAttendanceRecordsReport() {
  const dispatch = useAppDispatch();
  const { year, month, startDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const organizationSnapshot = useAppSelector(selectReportOrganizationSnapshot);
  const attendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const displayMonth = month === 'all' ? Number(startDate.slice(5, 7)) : month;
  const apiRecordsQuery = useAttendanceRecordsQuery(
    buildAttendanceMonthKey(year, displayMonth),
  );
  const attendanceRecords = isApiDataSource
    ? apiRecordsQuery.data ?? []
    : storeAttendanceRecords;

  const handleYearChange = (value: number) => {
    dispatch(setYear(value));
    if (month === 'all') dispatch(setMonth(displayMonth));
  };

  const days = useMemo(() => Array.from(
    { length: new Date(year, displayMonth, 0).getDate() },
    (_, index) => {
      const day = index + 1;
      const date = `${year}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        day,
        date,
        weekday: new Date(`${date}T00:00:00`).getDay(),
        holiday: getKoreanPublicHoliday(date),
      } satisfies AttendanceRecordDay;
    },
  ), [year, displayMonth]);

  const employees = useMemo(() =>
    organizationSnapshot.employees.map<AttendanceReportEmployee>((employee) => ({
      id: employee.id,
      name: employee.name,
      department: employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
      position: employee.position,
      shiftWorker: employee.shiftWorker,
    })),
  [organizationSnapshot]);

  const getCell = (
    employee: AttendanceReportEmployee,
    day: number,
  ): AttendanceCellValue | undefined => {
    const date = `${year}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceRecords.find(
      (item) => item.employeeId === employee.id && item.date === date,
    );
    if (!record) return undefined;

    const labels = record.events.map(
      (event) => attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId,
    );

    if (hasAnyCode(record, ['ABSENT', 'ATT04'])) return { top: '결근', status: 'warning' };
    if (hasAnyCode(record, ['ANNUAL', 'SICK', 'ATT05'])) {
      return { top: labels.join(', '), status: 'leave' };
    }
    if (hasAnyCode(record, ['HALF_PM', 'ATT06'])) {
      return {
        top: record.checkIn
          ? `${hasAnyCode(record, ['LATE', 'ATT02']) ? '지각' : '출근'} ${record.checkIn}`
          : '출근 미기록',
        bottom: record.checkOut ? `반차퇴근 ${record.checkOut}` : '퇴근 미기록',
        status: 'leave',
      };
    }
    if (hasAnyCode(record, ['HALF_AM'])) {
      return {
        top: record.checkIn ? `반차출근 ${record.checkIn}` : '출근 미기록',
        bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
        status: 'leave',
      };
    }
    if (hasAnyCode(record, ['REMOTE_WORK'])) {
      return {
        top: record.checkIn ? `재택 ${record.checkIn}` : '출근 미기록',
        bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
        status: 'normal',
      };
    }
    if (hasAnyCode(record, ['EARLY_LEAVE', 'ATT03'])) {
      return {
        top: record.checkIn ? `출근 ${record.checkIn}` : '출근 미기록',
        bottom: record.checkOut ? `조퇴 ${record.checkOut}` : '퇴근 미기록',
        status: 'warning',
      };
    }
    if (hasAnyCode(record, ['LATE', 'ATT02'])) {
      return {
        top: record.checkIn ? `지각 ${record.checkIn}` : '출근 미기록',
        bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
        status: 'late',
      };
    }
    if (labels.length > 0) {
      return {
        top: labels.join(', '),
        bottom: record.checkIn || record.checkOut
          ? `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}`
          : undefined,
        status: 'leave',
      };
    }
    return {
      top: record.checkIn ? `출근 ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
      status: 'normal',
    };
  };

  return {
    year,
    displayMonth,
    days,
    employees,
    getCell,
    isApiLoading: isApiDataSource && apiRecordsQuery.isLoading,
    isApiEmpty: isApiDataSource && apiRecordsQuery.isSuccess && (apiRecordsQuery.data?.length ?? 0) === 0,
    isApiError: isApiDataSource && apiRecordsQuery.isError,
    setMonth: (value: number) => dispatch(setMonth(value)),
    handleYearChange,
  };
}

