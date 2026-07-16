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

const getMonthStartDate = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}-01`;

const getMonthEndDate = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;

const getDefaultCalendarMonth = (year: number) => {
  const today = new Date();
  return today.getFullYear() === year ? today.getMonth() + 1 : 1;
};

export function useFilteredAttendanceReport() {
  const { year, month, week, startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const attendanceCodes = useMemo(
    () => (isApiDataSource ? apiAttendanceCodesQuery.data ?? [] : storeAttendanceCodes),
    [apiAttendanceCodesQuery.data, storeAttendanceCodes],
  );
  const periodType = week !== 'all' ? 'WEEK' : month !== 'all' ? 'MONTH' : 'YEAR';
  const isYearPeriod = periodType === 'YEAR';
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(() =>
    month === 'all' ? getDefaultCalendarMonth(year) : month);
  const calendarMonth = month === 'all' ? selectedCalendarMonth : month;
  const calendarStartDate = isYearPeriod ? getMonthStartDate(year, calendarMonth) : startDate;
  const calendarEndDate = isYearPeriod ? getMonthEndDate(year, calendarMonth) : endDate;
  const apiRecordsQuery = useStatisticsAttendanceQuery({
    periodType,
    year,
    month: month === 'all' ? undefined : month,
    week: week === 'all' ? undefined : week,
  });
  const attendanceRecords = useMemo(() => (
    isApiDataSource ? apiRecordsQuery.data ?? [] : storeAttendanceRecords
  ).filter((record) => record.date >= startDate && record.date <= endDate), [
    apiRecordsQuery.data,
    endDate,
    startDate,
    storeAttendanceRecords,
  ]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const initializedCodes = useRef(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');

  const availableCodeIds = useMemo(() => {
    const ids = new Set(attendanceCodes.map((code) => code.id));
    attendanceRecords.forEach((record) => {
      record.events.forEach((event) => ids.add(event.codeId));
    });
    return [...ids];
  }, [attendanceCodes, attendanceRecords]);

  useEffect(() => {
    if (initializedCodes.current || availableCodeIds.length === 0) return;
    setSelectedCodes(availableCodeIds);
    initializedCodes.current = true;
  }, [availableCodeIds]);

  const effectiveSelectedCodes = useMemo(
    () => selectedCodes.filter((id) => availableCodeIds.includes(id)),
    [availableCodeIds, selectedCodes],
  );
  const rows = useMemo(() => {
    const rowMap = new Map<string, FilteredAttendanceRow>();

    attendanceRecords.forEach((record) => {
      record.events
        .filter((event) => effectiveSelectedCodes.includes(event.codeId))
        .forEach((event, index) => {
          const key = [
            record.date,
            record.employeeId,
            record.employeeName,
            event.codeId,
            event.detail,
          ].join('|');

          if (rowMap.has(key)) return;

          rowMap.set(key, {
            id: `${record.id}-${index}`,
            date: displayDate(record.date),
            dateKey: record.date,
            department: record.department,
            name: record.employeeName,
            codeId: event.codeId,
            content: attendanceCodes.find((code) => code.id === event.codeId)?.label
              ?? event.detail
              ?? event.codeId,
            detail: event.detail,
          });
        });
    });

    return [...rowMap.values()];
  }, [attendanceRecords, attendanceCodes, effectiveSelectedCodes]);

  return {
    year,
    month,
    startDate,
    endDate,
    calendarMonth,
    calendarStartDate,
    calendarEndDate,
    isYearPeriod,
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
    setSelectedCalendarMonth,
    setViewMode,
  };
}

export { WEEKDAYS };
