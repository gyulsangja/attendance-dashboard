import type { AttendanceCsvResult } from './attendanceCsvTypes';
import { parseCsvLines } from './attendanceCsvUtils';
import { parseVerticalAttendanceCsv } from './parseVerticalAttendanceCsv';
import { parseWideAttendanceCsv } from './parseWideAttendanceCsv';

export type {
  AttendanceCsvError,
  AttendanceCsvResult,
  AttendanceCsvRow,
} from './attendanceCsvTypes';

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
    return {
      totalRows: 0,
      rows: [],
      errors: [{ row: 1, message: 'CSV 파일이 비어 있습니다.' }],
    };
  }

  const wideResult = parseWideAttendanceCsv(csvRows);
  return wideResult ?? parseVerticalAttendanceCsv(csvRows);
};
