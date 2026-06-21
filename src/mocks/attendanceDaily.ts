import { attendanceRecords, getReportEmployee } from './reports/reportData';

export type AttendanceDaily = {
  id: number;
  employeeId: number;
  name: string;
  department: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  memo?: string;
  isAdjusted: boolean;
};

// 이전 서비스 호환용 파생 데이터입니다. 원본은 reportData의 attendanceRecords입니다.
export const attendanceDaily: AttendanceDaily[] = attendanceRecords.map((record) => {
  const employee = getReportEmployee(record.employeeId);
  return {
    id: record.id,
    employeeId: record.employeeId,
    name: employee?.name ?? '-',
    department: employee?.department ?? '-',
    date: record.date,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    memo: record.memo,
    isAdjusted: false,
  };
});
