export type WeekInMonth = {
  week: number;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  label: string;
};

const formatDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const getWeekStart = (date: Date) =>
  addDays(date, -date.getDay());

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}`;

const getWeekOwner = (weekStart: Date) => {
  const counts = new Map<string, number>();

  Array.from({ length: 7 }).forEach((_, index) => {
    const key = getMonthKey(addDays(weekStart, index));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const [ownerKey] = [...counts.entries()]
    .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)[0];
  const [year, month] = ownerKey.split('-').map(Number);

  return { year, month };
};

export const getWeeksInMonth = (
  year: number,
  month: number,
): WeekInMonth[] => {
  const weeks: WeekInMonth[] = [];
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);

  let currentWeekStart = getWeekStart(firstDate);
  const lastWeekStart = getWeekStart(lastDate);

  while (currentWeekStart <= lastWeekStart) {
    const owner = getWeekOwner(currentWeekStart);

    if (owner.year === year && owner.month === month) {
      const week = weeks.length + 1;

      weeks.push({
        week,
        year,
        month,
        startDate: formatDateKey(currentWeekStart),
        endDate: formatDateKey(addDays(currentWeekStart, 6)),
        label: `${week}주차`,
      });
    }

    currentWeekStart = addDays(currentWeekStart, 7);
  }

  return weeks;
};

export const getWeekInMonthByDate = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string'
    ? new Date(`${dateValue}T00:00:00`)
    : dateValue;
  const dateKey = formatDateKey(date);
  const weekStart = getWeekStart(date);
  const owner = getWeekOwner(weekStart);

  return getWeeksInMonth(owner.year, owner.month).find(
    (week) => dateKey >= week.startDate && dateKey <= week.endDate,
  ) ?? null;
};
