import type {
  AttendanceCsvColumnIndexes,
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

const requiredHeaderLabels: Record<keyof AttendanceCsvColumnIndexes, string> = {
  employeeName: '구성원명',
  department: '부서',
  date: '일자',
  checkIn: '출근시간',
  checkOut: '퇴근시간',
};

const getColumnIndexes = (headerRow: string[]): AttendanceCsvColumnIndexes => {
  const headers = headerRow.map(normalizeHeader);
  const department = findHeader(headers, headerAliases.department);
  const deviceDepartment = findHeader(headers, headerAliases.deviceDepartment);
  const cardNumber = findHeader(headers, headerAliases.cardNumber);

  return {
    employeeName: findHeader(headers, headerAliases.employeeName),
    department: cardNumber >= 0 && deviceDepartment >= 0 ? deviceDepartment : department,
    date: findHeader(headers, headerAliases.date),
    checkIn: findHeader(headers, headerAliases.checkIn),
    checkOut: findHeader(headers, headerAliases.checkOut),
  };
};

const getMissingHeaders = (indexes: AttendanceCsvColumnIndexes) =>
  Object.entries(indexes)
    .filter(([, index]) => index < 0)
    .map(([key]) => requiredHeaderLabels[key as keyof AttendanceCsvColumnIndexes]);

export const parseVerticalAttendanceCsv = (csvRows: string[][]): AttendanceCsvResult => {
  const indexes = getColumnIndexes(csvRows[0]);
  const missing = getMissingHeaders(indexes);
  if (missing.length > 0) {
    return {
      totalRows: Math.max(0, csvRows.length - 1),
      rows: [],
      errors: [{ row: 1, message: `필수 헤더가 없습니다: ${missing.join(', ')}` }],
    };
  }

  const rows: AttendanceCsvRow[] = [];
  const errors: AttendanceCsvError[] = [];
  const keys = new Set<string>();

  csvRows.slice(1).forEach((values, index) => {
    const rowNumber = index + 2;
    const employeeName = (values[indexes.employeeName] ?? '').trim();
    const department = (values[indexes.department] ?? '').trim();
    const date = normalizeDate(values[indexes.date] ?? '');
    const checkIn = normalizeTime(values[indexes.checkIn] ?? '');
    const checkOut = normalizeTime(values[indexes.checkOut] ?? '');
    const rowErrors: string[] = [];

    if (!employeeName) rowErrors.push('구성원명 필요');
    if (!department) rowErrors.push('부서 필요');
    if (!date) rowErrors.push('일자 형식 오류');
    if (checkIn === null) rowErrors.push('출근시간 형식 오류');
    if (checkOut === null) rowErrors.push('퇴근시간 형식 오류');
    if (checkIn === '' && checkOut === '') rowErrors.push('출근 또는 퇴근시간 필요');

    const key = `${employeeName}-${department}-${date}`;
    if (keys.has(key)) rowErrors.push('동일 구성원·부서·일자 중복');

    if (rowErrors.length > 0 || !date || checkIn === null || checkOut === null) {
      errors.push({ row: rowNumber, message: rowErrors.join(', ') });
      return;
    }

    keys.add(key);
    rows.push({ row: rowNumber, employeeName, department, date, checkIn, checkOut });
  });

  return { totalRows: csvRows.length - 1, rows, errors };
};
