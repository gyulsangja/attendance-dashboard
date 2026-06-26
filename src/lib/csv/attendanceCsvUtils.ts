import { formatDateKey } from '@/lib/date';

export const headerAliases = {
  employeeName: ['employeename', 'employee_name', 'name', '구성원명', '직원명', '이름'],
  department: ['department', 'departmentname', 'department_name', '부서', '소속'],
  deviceDepartment: ['직군', 'jobgroup', 'job_group'],
  cardNumber: ['카드번호', '카드 번호', 'cardnumber', 'card_no', 'cardnumber'],
  date: ['date', 'workdate', 'work_date', '일자', '근무일', '날짜'],
  checkIn: ['checkin', 'check_in', '출근', '출근시간'],
  checkOut: ['checkout', 'check_out', '퇴근', '퇴근시간'],
};

export const normalizeHeader = (value: string) => value
  .replace(/^\uFEFF/, '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '');

export const parseCsvLines = (text: string) => {
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

export const findHeader = (headers: string[], aliases: string[]) =>
  headers.findIndex((header) => aliases.includes(header));

export const normalizeDate = (value: string) => {
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

export const normalizeTime = (value: string) => {
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
