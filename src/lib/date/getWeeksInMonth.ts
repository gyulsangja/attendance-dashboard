export const getWeeksInMonth = (
  year: number,
  month: number,
) => {
  const weeks = [];

  const lastDay = new Date(
    year,
    month,
    0,
  ).getDate();

  let currentDay = 1;

  while (currentDay <= lastDay) {
    const currentDate = new Date(
      year,
      month - 1,
      currentDay,
    );

    const dayOfWeek =
      currentDate.getDay();

    const startDay = currentDay;

    const endDay = Math.min(
      currentDay + (6 - dayOfWeek),
      lastDay,
    );

    weeks.push({
      week: weeks.length + 1,

      startDate: `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,

      endDate: `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,

      label: `${weeks.length + 1}주차`,
    });

    currentDay = endDay + 1;
  }

  return weeks;
};