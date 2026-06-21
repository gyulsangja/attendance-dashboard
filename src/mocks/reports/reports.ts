import { attendanceCodes } from '../attendanceCodes';
import { attendanceRecords, getReportEmployee } from './reportData';

export type ReportRow = {
  id: number;
  date: string;
  displayDate: string;
  employeeId: number;
  name: string;
  department: string;
  codeId: string;
  content?: string;
  contentDetail?: string;
  memo?: string;
};

// 이전 화면 호환용 파생 데이터입니다. 원본은 attendanceRecords입니다.
export const reports: ReportRow[] = attendanceRecords.flatMap((record) => {
  const employee = getReportEmployee(record.employeeId);
  return record.events.map((event, index) => ({
    id: record.id * 100 + index,
    date: record.date,
    displayDate: record.date,
    employeeId: record.employeeId,
    name: employee?.name ?? '-',
    department: employee?.department ?? '-',
    codeId: event.codeId,
    content: attendanceCodes.find((code) => code.id === event.codeId)?.label,
    contentDetail: event.detail,
    memo: record.memo,
  }));
});
