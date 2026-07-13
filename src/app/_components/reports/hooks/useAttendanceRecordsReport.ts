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

    const labels = record.events.map(
      (event) => attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId,
    );

    const checkInText = record.checkIn ? `출근 ${record.checkIn}` : '출근 미기록';
    const checkOutText = record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록';

    if (hasAnyCode(record, ['ABSENT', 'ATT04'])) return { top: '결근', status: 'warning' };
    if (hasAnyCode(record, ['ANNUAL', 'SICK', 'ATT05'])) {
      return { top: labels.join(', '), status: 'leave' };
    }
    if (hasAnyCode(record, ['HALF_PM', 'ATT06'])) {
      return {
        top: record.checkIn
          ? `${hasAnyCode(record, ['LATE', 'ATT02']) ? '지각' : '출근'} ${record.checkIn}`
          : '출근 미기록',
        bottom: checkOutText,
        status: 'leave',
      };
    }
    if (hasAnyCode(record, ['HALF_AM'])) {
      return {
        top: record.checkIn ? `반차출근 ${record.checkIn}` : '출근 미기록',
        bottom: checkOutText,
        status: 'leave',
      };
    }
    if (hasAnyCode(record, ['REMOTE_WORK'])) {
      return {
        top: record.checkIn ? `재택 ${record.checkIn}` : '출근 미기록',
        bottom: checkOutText,
        status: 'normal',
      };
    }
    if (hasAnyCode(record, ['EARLY_LEAVE', 'ATT03'])) {
      return {
        top: checkInText,
        bottom: record.checkOut ? `조퇴 ${record.checkOut}` : '퇴근 미기록',
        status: 'warning',
      };
    }
    if (hasAnyCode(record, ['LATE', 'ATT02'])) {
      return {
        top: record.checkIn ? `지각 ${record.checkIn}` : '출근 미기록',
        bottom: checkOutText,
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
      top: checkInText,
      bottom: checkOutText,
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

