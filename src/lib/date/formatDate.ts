export const formatDate = (
  date: Date,
) => {
  return date.toLocaleDateString('ko-KR');
};

export const formatDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');
