'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useStatisticsAttendanceQuery } from '@/hooks/useStatisticsQueries';
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
  const { year, month, week, startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const attendanceCodes = useMemo(
    () => (isApiDataSource ? apiAttendanceCodesQuery.data ?? [] : storeAttendanceCodes),
    [apiAttendanceCodesQuery.data, storeAttendanceCodes],
  );
  const calendarMonth = month === 'all' ? Number(startDate.slice(5, 7)) : month;
  const periodType = week !== 'all' ? 'WEEK' : month !== 'all' ? 'MONTH' : 'YEAR';
  const apiRecordsQuery = useStatisticsAttendanceQuery({
    periodType,
    year,
    month: month === 'all' ? undefined : month,
    week: week === 'all' ? undefined : week,
  });
  const attendanceRecords = useMemo(() => (
    isApiDataSource ? apiRecordsQuery.data ?? [] : storeAttendanceRecords
  ), [apiRecordsQuery.data, storeAttendanceRecords]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const initializedCodes = useRef(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');

  const availableCodeIds = useMemo(() => attendanceCodes.map((code) => code.id), [attendanceCodes]);
  useEffect(() => {
    if (initializedCodes.current || availableCodeIds.length === 0) return;
    setSelectedCodes(availableCodeIds);
    initializedCodes.current = true;
  }, [availableCodeIds]);
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
    attendanceCodes,
    selectedCodes: effectiveSelectedCodes,
    rows,
    viewMode,
    isApiLoading: isApiDataSource && apiRecordsQuery.isLoading,
    isApiEmpty: isApiDataSource && apiRecordsQuery.isSuccess && (apiRecordsQuery.data?.length ?? 0) === 0,
    isApiError: isApiDataSource && apiRecordsQuery.isError,
    isCodeLoading: isApiDataSource && apiAttendanceCodesQuery.isLoading,
    isCodeError: isApiDataSource && apiAttendanceCodesQuery.isError,
    setSelectedCodes,
    setViewMode,
  };
}

export { WEEKDAYS };





