import { formatDateKey } from '@/lib/date';

export type AttendanceCsvRow = {
  row: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
};

export type AttendanceCsvError = {
  row: number;
  message: string;
};

export type AttendanceCsvResult = {
  totalRows: number;
  rows: AttendanceCsvRow[];
  errors: AttendanceCsvError[];
};

const headerAliases = {
  employeeName: ['employeename', 'employee_name', 'name', '구성원명', '직원명', '이름'],
  department: ['department', 'departmentname', 'department_name', '부서', '소속'],
  date: ['date', 'workdate', 'work_date', '일자', '근무일', '날짜'],
  checkIn: ['checkin', 'check_in', '출근', '출근시간'],
  checkOut: ['checkout', 'check_out', '퇴근', '퇴근시간'],
};

const normalizeHeader = (value: string) => value
  .replace(/^\uFEFF/, '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '');

const parseCsvLines = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const findHeader = (headers: string[], aliases: string[]) =>
  headers.findIndex((header) => aliases.includes(header));

const normalizeDate = (value: string) => {
  const trimmed = value.trim();
  if (/^\d{5}(?:\.\d+)?$/.test(trimmed)) {
    const serial = Number(trimmed);
    const parsed = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
    return parsed.toISOString().slice(0, 10);
  }
  const match = trimmed.match(/^(\d{4})[-/.년]\s*(\d{1,2})[-/.월]\s*(\d{1,2})(?:일)?(?:\s+.*)?$/);
  if (!match) return null;
  const date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) || formatDateKey(parsed) !== date
    ? null
    : date;
};

const normalizeTime = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(trimmed)) {
    const totalMinutes = Math.round(Number(trimmed) * 24 * 60) % (24 * 60);
    return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const parseWideAttendanceCsv = (csvRows: string[][]): AttendanceCsvResult | null => {
  if (csvRows.length < 2) return null;
  const firstHeaders = csvRows[0].map(normalizeHeader);
  const secondHeaders = csvRows[1].map(normalizeHeader);
  const employeeNameIndex = findHeader(firstHeaders, headerAliases.employeeName);
  const departmentIndex = findHeader(firstHeaders, headerAliases.department);
  const dateColumns = firstHeaders.flatMap((header, index) => {
    const date = normalizeDate(header);
    const timeType = headerAliases.checkIn.includes(secondHeaders[index])
      ? 'checkIn'
      : headerAliases.checkOut.includes(secondHeaders[index])
        ? 'checkOut'
        : null;
    return date && timeType ? [{ index, date, timeType }] : [];
  });

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

export const decodeCsvFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  return utf8.includes('\uFFFD')
    ? new TextDecoder('euc-kr').decode(buffer)
    : utf8;
};

export const parseAttendanceCsv = (text: string): AttendanceCsvResult => {
  const csvRows = parseCsvLines(text);
  if (csvRows.length === 0) {
    return { totalRows: 0, rows: [], errors: [{ row: 1, message: 'CSV 파일이 비어 있습니다.' }] };
  }

  const wideResult = parseWideAttendanceCsv(csvRows);
  if (wideResult) return wideResult;

  const headers = csvRows[0].map(normalizeHeader);
  const indexes = {
    employeeName: findHeader(headers, headerAliases.employeeName),
    department: findHeader(headers, headerAliases.department),
    date: findHeader(headers, headerAliases.date),
    checkIn: findHeader(headers, headerAliases.checkIn),
    checkOut: findHeader(headers, headerAliases.checkOut),
  };
  const missing = Object.entries(indexes)
    .filter(([, index]) => index < 0)
    .map(([key]) => ({
      employeeName: '구성원명',
      department: '부서',
      date: '일자',
      checkIn: '출근시간',
      checkOut: '퇴근시간',
    })[key as keyof typeof indexes]);
  if (missing.length > 0) {
    return {
      totalRows: Math.max(0, csvRows.length - 1),
      rows: [],
      errors: [{ row: 1, message: `필수 열이 없습니다: ${missing.join(', ')}` }],
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
