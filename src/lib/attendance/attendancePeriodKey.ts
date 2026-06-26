export const toPaddedMonth = (month: number) => String(month).padStart(2, '0');

export const buildAttendanceMonthKey = (year: number, month: number) =>
  `${year}-${toPaddedMonth(month)}`;

export const buildAttendanceWeekKey = (year: number, month: number, week: number) =>
  `${buildAttendanceMonthKey(year, month)}-${week}`;

export const buildAttendanceYearKey = (year: number) => String(year);
