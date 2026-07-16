'use client';

import { useMemo } from 'react';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useHolidaysQuery } from '@/hooks/useHolidayQueries';
import { useStatisticsMonthlyAttendanceRecordsQuery } from '@/hooks/useStatisticsQueries';
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

const getTimeText = (label: string, value?: string) => `${label} ${value || '-'}`;

export function useAttendanceRecordsReport() {
  const dispatch = useAppDispatch();
  const { year, month, startDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const organizationSnapshot = useAppSelector(selectReportOrganizationSnapshot);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const displayMonth = month === 'all' ? Number(startDate.slice(5, 7)) : month;
  const apiRecordsQuery = useStatisticsMonthlyAttendanceRecordsQuery(year, displayMonth);
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const apiHolidaysQuery = useHolidaysQuery(year);
  const attendanceCodes = useMemo(
    () => (isApiDataSource ? apiAttendanceCodesQuery.data ?? [] : storeAttendanceCodes),
    [apiAttendanceCodesQuery.data, storeAttendanceCodes],
  );
  const attendanceRecords = useMemo(() => (
    isApiDataSource ? apiRecordsQuery.data?.records ?? [] : storeAttendanceRecords
  ), [apiRecordsQuery.data, storeAttendanceRecords]);
  const apiHolidayByDate = useMemo(() => {
    const holidays = new Map<string, NonNullable<AttendanceRecordDay['holiday']>>();

    attendanceRecords.forEach((record) => {
      if (record.isHoliday && record.holidayName) {
        holidays.set(record.date, {
          date: record.date,
          name: record.holidayName,
          type: 'TEMPORARY',
        });
      }
    });

    if (isApiDataSource) {
      (apiHolidaysQuery.data ?? []).forEach((holiday) => {
        holidays.set(holiday.date, {
          date: holiday.date,
          name: holiday.name,
          type: holiday.type,
        });
      });
    }

    return holidays;
  }, [apiHolidaysQuery.data, attendanceRecords]);

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
        holiday: apiHolidayByDate.get(date) ?? (isApiDataSource ? null : getKoreanPublicHoliday(date)),
      } satisfies AttendanceRecordDay;
    },
  ), [apiHolidayByDate, year, displayMonth]);

  const employees = useMemo(() => {
    const sourceEmployees = isApiDataSource
      ? apiRecordsQuery.data?.employees ?? []
      : organizationSnapshot.employees;

    return sourceEmployees.map<AttendanceReportEmployee>((employee) => ({
      id: employee.id,
      name: employee.name,
      department: 'teamId' in employee
        ? employee.teamId === UNASSIGNED_TEAM_ID
          ? UNASSIGNED_TEAM_NAME
          : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-'
        : employee.department,
      position: employee.position,
      shiftWorker: 'shiftWorker' in employee ? Boolean(employee.shiftWorker) : false,
    }));
  }, [apiRecordsQuery.data, organizationSnapshot]);

  const getCell = (
    employee: AttendanceReportEmployee,
    day: number,
  ): AttendanceCellValue | undefined => {
    const date = `${year}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceRecords.find(
      (item) => item.employeeId === employee.id && item.date === date,
    );
    if (!record) return undefined;

    const labels = record.events
      .map((event) => attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.detail ?? event.codeId)
      .filter(Boolean);
    const labelText = labels.join(', ');
    const timeText = `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}`;

    if (hasAnyCode(record, ['ABSENT', 'ATT04'])) {
      return { top: labelText || '결근', bottom: timeText, status: 'normal' };
    }
    if (hasAnyCode(record, ['ANNUAL', 'SICK', 'ATT05', 'HALF_PM', 'HALF_AM', 'ATT06', 'REMOTE_WORK'])) {
      return { top: labelText || '근태코드', bottom: timeText, status: 'leave' };
    }
    if (hasAnyCode(record, ['EARLY_LEAVE', 'ATT03', 'LATE', 'ATT02'])) {
      return { top: labelText || '근태코드', bottom: timeText, status: 'normal' };
    }
    if (labelText) {
      return { top: labelText, bottom: timeText, status: 'normal' };
    }

    return {
      top: getTimeText('출근', record.checkIn),
      bottom: getTimeText('퇴근', record.checkOut),
      status: 'normal',
    };
  };

  return {
    year,
    displayMonth,
    days,
    employees,
    getCell,
    isApiLoading: isApiDataSource && (apiRecordsQuery.isLoading || apiAttendanceCodesQuery.isLoading),
    isApiEmpty: isApiDataSource && apiRecordsQuery.isSuccess && (apiRecordsQuery.data?.records.length ?? 0) === 0,
    isApiError: isApiDataSource && (apiRecordsQuery.isError || apiAttendanceCodesQuery.isError),
    setMonth: (value: number) => dispatch(setMonth(value)),
    handleYearChange,
  };
}
