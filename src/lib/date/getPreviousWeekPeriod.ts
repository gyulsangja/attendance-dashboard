import { getWeeksInMonth } from './getWeeksInMonth';

const formatDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const getPreviousWeekPeriod = (baseDate = new Date()) => {
  const previousWeekDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() - 7,
  );
  const year = previousWeekDate.getFullYear();
  const month = previousWeekDate.getMonth() + 1;
  const dateKey = formatDateKey(previousWeekDate);
  const weeks = getWeeksInMonth(year, month);
  const week = weeks.find(
    (item) => dateKey >= item.startDate && dateKey <= item.endDate,
  ) ?? weeks[0];

  return {
    year,
    month,
    weekNumber: week?.week ?? 1,
    startDate: week?.startDate ?? dateKey,
    endDate: week?.endDate ?? dateKey,
    label: week?.label ?? '1주차',
  };
};
