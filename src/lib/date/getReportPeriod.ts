import { getWeeksInMonth } from './getWeeksInMonth';

export const getReportPeriod = (
  year: number,
  month: number | 'all',
  week: number | 'all',
) => {
  if (month === 'all') {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      label: `${year}년`,
    };
  }

  if (week === 'all') {
    const lastDay = new Date(
      year,
      month,
      0,
    ).getDate();

    return {
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      endDate: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
      label: `${year}년 ${month}월`,
    };
  }

  const weeks = getWeeksInMonth(year, month);
  const selected = weeks.find((item) => item.week === week);

  return selected ?? weeks[0];
};
