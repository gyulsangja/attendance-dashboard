import { attendanceRecords, getReportEmployee } from './reports/reportData';

export const attendanceLogs = attendanceRecords.map((record) => {
  const employee = getReportEmployee(record.employeeId);
  return {
    id: record.id,
    employeeId: record.employeeId,
    name: employee?.name ?? '-',
    department: employee?.department ?? '-',
    date: record.date,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    source: 'CSV' as const,
  };
});
