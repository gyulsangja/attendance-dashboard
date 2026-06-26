'use client';

import { useMemo, useState } from 'react';
import { useAttendanceRecordsQuery } from '@/hooks/useAttendanceRecordQueries';
import { buildAttendanceMonthKey } from '@/lib/attendance/attendancePeriodKey';
import { isApiDataSource } from '@/repositories/config';
import {
  selectReportAttendanceCodes,
  selectReportPeriod,
  selectReportRecords,
} from '@/selectors/reportSelectors';
import { useAppSelector } from '@/store/hooks';

export type FilteredAttendanceRow = {
  id: string;
  date: string;
  dateKey: string;
  department: string;
  name: string;
  codeId: string;
  content: string;
  detail: string;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const displayDate = (date: string) =>
  `${date}(${WEEKDAYS[new Date(`${date}T00:00:00`).getDay()]})`;

export function useFilteredAttendanceReport() {
  const { year, month, startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const attendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const calendarMonth = month === 'all' ? Number(startDate.slice(5, 7)) : month;
  const apiRecordsQuery = useAttendanceRecordsQuery(
    buildAttendanceMonthKey(year, calendarMonth),
  );
  const attendanceRecords =
    isApiDataSource && apiRecordsQuery.data && apiRecordsQuery.data.length > 0
      ? apiRecordsQuery.data
      : storeAttendanceRecords;
  const [selectedCodes, setSelectedCodes] = useState<string[]>(
    () => attendanceCodes.map((code) => code.id),
  );
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');

  const availableCodeIds = useMemo(() => attendanceCodes.map((code) => code.id), [attendanceCodes]);
  const effectiveSelectedCodes = useMemo(
    () => selectedCodes.filter((id) => availableCodeIds.includes(id)),
    [availableCodeIds, selectedCodes],
  );
  const rows = useMemo(() => attendanceRecords.flatMap((record) =>
    record.events
      .filter((event) => effectiveSelectedCodes.includes(event.codeId))
      .map((event, index) => ({
        id: `${record.id}-${index}`,
        date: displayDate(record.date),
        dateKey: record.date,
        department: record.department,
        name: record.employeeName,
        codeId: event.codeId,
        content: attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId,
        detail: event.detail,
      })),
  ), [attendanceRecords, attendanceCodes, effectiveSelectedCodes]);

  return {
    year,
    month,
    startDate,
    endDate,
    calendarMonth,
    selectedCodes: effectiveSelectedCodes,
    rows,
    viewMode,
    isApiLoading: isApiDataSource && apiRecordsQuery.isLoading,
    isApiFallback: isApiDataSource && (apiRecordsQuery.data?.length ?? 0) === 0,
    setSelectedCodes,
    setViewMode,
  };
}

export { WEEKDAYS };



