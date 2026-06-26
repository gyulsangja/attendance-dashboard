'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  attendanceCellStyles,
  WEEKDAYS,
  type AttendanceRecordDay,
  type AttendanceCellStatus,
  type AttendanceCellValue,
  type AttendanceReportEmployee,
} from './hooks/useAttendanceRecordsReport';

type AttendanceRecordsTableProps = {
  days: AttendanceRecordDay[];
  employees: AttendanceReportEmployee[];
  getCell: (employee: AttendanceReportEmployee, day: number) => AttendanceCellValue | undefined;
};

export default function AttendanceRecordsTable({
  days,
  employees,
  getCell,
}: AttendanceRecordsTableProps) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 560, border: '1px solid #e2e8f0' }}>
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 3000,
          tableLayout: 'fixed',
          '& th, & td': { borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 4, width: 120, bgcolor: '#f8fafc', fontWeight: 800 }}>부서</TableCell>
            <TableCell sx={{ position: 'sticky', left: 120, zIndex: 4, width: 100, bgcolor: '#f8fafc', fontWeight: 800 }}>이름</TableCell>
            {days.map(({ day, weekday, holiday }) => (
              <TableCell
                key={day}
                align="center"
                sx={{
                  width: 86,
                  p: 1,
                  bgcolor: holiday || weekday === 0 ? '#fff1f2' : weekday === 6 ? '#eff6ff' : '#f8fafc',
                  fontWeight: 800,
                  color: holiday || weekday === 0 ? '#dc2626' : weekday === 6 ? '#2563eb' : '#334155',
                }}
              >
                <div>{day}일</div>
                <div className="text-[11px]">{holiday?.name ?? WEEKDAYS[weekday]}</div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={`${employee.id}-${employee.department}`} hover>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, width: 120, bgcolor: 'white', fontWeight: 600 }}>{employee.department}</TableCell>
              <TableCell sx={{ position: 'sticky', left: 120, zIndex: 2, width: 100, bgcolor: 'white', fontWeight: 800 }}>{employee.name}</TableCell>
              {days.map(({ day, weekday, holiday }) => {
                const regularRestDay = !employee.shiftWorker && (Boolean(holiday) || weekday === 0 || weekday === 6);
                const value = getCell(employee, day)
                  ?? (regularRestDay ? { top: holiday?.name ?? '휴무', status: 'holiday' as AttendanceCellStatus } : undefined);

                return (
                  <TableCell
                    key={day}
                    align="center"
                    className={value ? attendanceCellStyles[value.status] : 'text-slate-300'}
                    sx={{
                      height: 58,
                      p: 0.5,
                      bgcolor: regularRestDay ? holiday || weekday === 0 ? '#fff7f7' : '#f7faff' : undefined,
                    }}
                  >
                    <div className="text-xs font-bold">{value?.top ?? '-'}</div>
                    {value?.bottom && <div className="mt-1 text-[11px] opacity-75">{value.bottom}</div>}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
