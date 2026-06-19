import { WEEKDAYS } from './constants';

export const getMonthDays = (
  year: number,
  month: number,
) => {
  const lastDay = new Date(year, month, 0).getDate();

  return Array.from(
    { length: lastDay },
    (_, index) => {
      const day = index + 1;

      const date = new Date(
        year,
        month - 1,
        day,
      );

      const weekday =
        WEEKDAYS[date.getDay()];

      return {
        day,
        weekday,
        date,
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isSunday: weekday === '일',
        isSaturday: weekday === '토',
      };
    },
  );
};