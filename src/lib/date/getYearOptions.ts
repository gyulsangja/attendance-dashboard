export const getYearOptions = (selectedYear: number, options?: { past?: number; future?: number }) => {
  const currentYear = new Date().getFullYear();
  const past = options?.past ?? 5;
  const future = options?.future ?? 0;
  const startYear = Math.min(selectedYear, currentYear - past);
  const endYear = Math.max(selectedYear, currentYear + future);

  return Array.from(
    { length: endYear - startYear + 1 },
    (_item, index) => endYear - index,
  );
};
