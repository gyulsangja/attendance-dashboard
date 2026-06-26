import type {
  AttendanceCsvError,
  AttendanceCsvResult,
  AttendanceCsvRow,
} from './attendanceCsvTypes';
import {
  findHeader,
  headerAliases,
  normalizeDate,
  normalizeHeader,
  normalizeTime,
} from './attendanceCsvUtils';

type DateColumn = {
  index: number;
  date: string;
  timeType: 'checkIn' | 'checkOut';
};

const findDateColumns = (firstHeaders: string[], secondHeaders: string[]) =>
  firstHeaders.flatMap<DateColumn>((header, index) => {
    const date = normalizeDate(header);
    const timeType = headerAliases.checkIn.includes(secondHeaders[index])
      ? 'checkIn'
      : headerAliases.checkOut.includes(secondHeaders[index])
        ? 'checkOut'
        : null;
    return date && timeType ? [{ index, date, timeType }] : [];
  });

export const parseWideAttendanceCsv = (csvRows: string[][]): AttendanceCsvResult | null => {
  if (csvRows.length < 2) return null;

  const firstHeaders = csvRows[0].map(normalizeHeader);
  const secondHeaders = csvRows[1].map(normalizeHeader);
  const employeeNameIndex = findHeader(firstHeaders, headerAliases.employeeName);
  const departmentIndex = findHeader(firstHeaders, headerAliases.department);
  const dateColumns = findDateColumns(firstHeaders, secondHeaders);

  if (employeeNameIndex < 0 || departmentIndex < 0 || dateColumns.length === 0) {
    return null;
  }

  const rows: AttendanceCsvRow[] = [];
  const errors: AttendanceCsvError[] = [];
  let totalRows = 0;

  csvRows.slice(2).forEach((values, index) => {
    const rowNumber = index + 3;
    const employeeName = (values[employeeNameIndex] ?? '').trim();
    const department = (values[departmentIndex] ?? '').trim();
    if (!employeeName && !department) return;

    if (!employeeName || !department) {
      errors.push({
        row: rowNumber,
        message: !employeeName ? '구성원명 필요' : '부서 필요',
      });
      return;
    }

    const dates = [...new Set(dateColumns.map((column) => column.date))];
    dates.forEach((date) => {
      const checkInColumn = dateColumns.find(
        (column) => column.date === date && column.timeType === 'checkIn',
      );
      const checkOutColumn = dateColumns.find(
        (column) => column.date === date && column.timeType === 'checkOut',
      );
      const rawCheckIn = checkInColumn ? values[checkInColumn.index] ?? '' : '';
      const rawCheckOut = checkOutColumn ? values[checkOutColumn.index] ?? '' : '';
      if (!rawCheckIn.trim() && !rawCheckOut.trim()) return;

      totalRows += 1;
      const checkIn = normalizeTime(rawCheckIn);
      const checkOut = normalizeTime(rawCheckOut);
      const rowErrors: string[] = [];
      if (checkIn === null) rowErrors.push(`${date} 출근시간 형식 오류`);
      if (checkOut === null) rowErrors.push(`${date} 퇴근시간 형식 오류`);
      if (rowErrors.length > 0 || checkIn === null || checkOut === null) {
        errors.push({ row: rowNumber, message: rowErrors.join(', ') });
        return;
      }
      rows.push({
        row: rowNumber,
        employeeName,
        department,
        date,
        checkIn,
        checkOut,
      });
    });
  });

  return { totalRows, rows, errors };
};
