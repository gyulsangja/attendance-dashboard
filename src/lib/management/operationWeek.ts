import { getWeeksInMonth } from '@/lib/date';
import type { AttendanceRecord } from '@/types/domain';

export type OperationWeekPeriod = {
  key: string;
  year: number;
  month: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
};

export const buildOperationWeekKey = (
  year: number,
  month: number,
  weekNumber: number,
) => `${year}-${month}-${weekNumber}`;

export const getOperationWeekPeriod = (
  year: number,
  month: number,
  weekNumber: number,
): OperationWeekPeriod => {
  const weeks = getWeeksInMonth(year, month);
  const selectedWeek = weeks.find((item) => item.week === weekNumber) ?? weeks[0];
  const resolvedWeekNumber = selectedWeek?.week ?? weekNumber;

  return {
    key: buildOperationWeekKey(year, month, resolvedWeekNumber),
    year,
    month,
    weekNumber: resolvedWeekNumber,
    startDate: selectedWeek?.startDate ?? `${year}-${String(month).padStart(2, '0')}-01`,
    endDate: selectedWeek?.endDate ?? `${year}-${String(month).padStart(2, '0')}-07`,
  };
};

export const getOperationWeekPeriodByDate = (date: string) => {
  const [year, month] = date.split('-').map(Number);
  const week = getWeeksInMonth(year, month).find(
    (item) => date >= item.startDate && date <= item.endDate,
  );

  if (!week) return null;

  return getOperationWeekPeriod(year, month, week.week);
};

export const getOperationWeekKeyByDate = (date: string) =>
  getOperationWeekPeriodByDate(date)?.key ?? null;

export const isDateInPeriod = (
  date: string,
  period: Pick<OperationWeekPeriod, 'startDate' | 'endDate'>,
) => date >= period.startDate && date <= period.endDate;

export const filterItemsByPeriod = <T extends { date: string }>(
  items: T[],
  period: Pick<OperationWeekPeriod, 'startDate' | 'endDate'>,
) => items.filter((item) => isDateInPeriod(item.date, period));

export const excludeItemsByPeriod = <T extends { date: string }>(
  items: T[],
  period: Pick<OperationWeekPeriod, 'startDate' | 'endDate'>,
) => items.filter((item) => !isDateInPeriod(item.date, period));

export const cloneAttendanceRecord = (record: AttendanceRecord): AttendanceRecord => ({
  ...record,
  events: record.events.map((event) => ({ ...event })),
});

export const cloneAttendanceRecords = (records: AttendanceRecord[]) =>
  records.map(cloneAttendanceRecord);
