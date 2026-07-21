'use client';

import { Box, Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { AttendanceCode, AttendanceRecord, OperationSchedule } from '@/types/domain';

export type WeeklyAttendanceEmployeeRow = {
  id: number;
  name: string;
  shiftWorker: boolean;
  department: string;
};

type UseWeeklyAttendanceGridParams = {
  days: { date: string; label: string }[];
  employees?: Array<{
    employeeId: number;
    employeeName: string;
    department: string;
    position?: string;
    shiftWorker?: boolean;
  }>;
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  attendanceCodes?: AttendanceCode[];
  department: string;
  onEdit: (employeeId: number, date: string) => void;
  readOnly?: boolean;
};

const getDayClassName = (
  date: string,
  type: 'header' | 'cell',
  records: AttendanceRecord[],
) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  const apiHoliday = records.some((record) => record.date === date && record.isHoliday);
  if (apiHoliday || day === 0) return `attendance-holiday-${type}`;
  if (day === 6) return `attendance-saturday-${type}`;
  return '';
};

const getDateLabel = (date: string) => {
  const [, month, day] = date.split('-');
  if (!month || !day) return date;

  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(new Date(`${date}T00:00:00`));
  return `${Number(month)}/${Number(day)}(${weekday})`;
};

export function useWeeklyAttendanceGrid({
  days,
  employees = [],
  records,
  schedules,
  attendanceCodes = [],
  department,
  onEdit,
  readOnly = false,
}: UseWeeklyAttendanceGridParams) {
  const employeeMap = new Map<number, WeeklyAttendanceEmployeeRow>();

  employees.forEach((employee) => {
    if (employeeMap.has(employee.employeeId)) return;
    employeeMap.set(employee.employeeId, {
      id: employee.employeeId,
      name: employee.employeeName,
      shiftWorker: Boolean(employee.shiftWorker),
      department: employee.department,
    });
  });

  records.forEach((record) => {
    if (employeeMap.has(record.employeeId)) return;
    employeeMap.set(record.employeeId, {
      id: record.employeeId,
      name: record.employeeName,
      shiftWorker: Boolean(record.isShiftWorker),
      department: record.department,
    });
  });

  schedules.forEach((schedule) => {
    if (employeeMap.has(schedule.employeeId)) return;
    employeeMap.set(schedule.employeeId, {
      id: schedule.employeeId,
      name: schedule.name,
      shiftWorker: false,
      department: schedule.department,
    });
  });

  const weekEmployees = [...employeeMap.values()].sort((a, b) =>
    a.department.localeCompare(b.department, 'ko') || a.name.localeCompare(b.name, 'ko'));
  const departments = [...new Set(weekEmployees.map((employee) => employee.department))];
  const rows = weekEmployees.filter(
    (employee) => department === 'all' || employee.department === department,
  );
  const attendanceCodeMap = new Map(attendanceCodes.map((code) => [code.id, code.label]));

  const displayDays = [...new Map([
    ...days.map((day) => [day.date, day] as const),
    ...records.map((record) => [
      record.date,
      { date: record.date, label: getDateLabel(record.date) },
    ] as const),
    ...schedules.map((schedule) => [
      schedule.date,
      { date: schedule.date, label: getDateLabel(schedule.date) },
    ] as const),
  ]).values()].sort((a, b) => a.date.localeCompare(b.date));

  const columns: GridColDef[] = [
    {
      field: 'department',
      headerName: '부서',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: '이름',
      minWidth: 90,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
    },
    ...displayDays.map((day) => ({
      field: day.date,
      headerName: getDateLabel(day.date),
      headerClassName: getDayClassName(day.date, 'header', records),
      cellClassName: getDayClassName(day.date, 'cell', records),
      minWidth: 130,
      flex: 1,
      align: 'center' as const,
      headerAlign: 'center' as const,
      sortable: false,
      filterable: false,
      renderCell: ({ row }: { row: WeeklyAttendanceEmployeeRow }) => {
        const record = records.find(
          (item) => item.employeeId === row.id && item.date === day.date,
        );
        const items = schedules.filter(
          (item) => item.employeeId === row.id && item.date === day.date,
        );
        const recordLabels = record?.events.map((event) => {
          const codeLabel = attendanceCodeMap.get(event.codeId);
          if (codeLabel) return codeLabel;
          if (event.detail && event.detail !== event.codeId) return event.detail;
          return event.codeId;
        }) ?? [];
        const publicHoliday = !row.shiftWorker && record?.isHoliday && record.holidayName
          ? { name: record.holidayName }
          : null;
        const attendanceLabels = [...new Set([
          ...(publicHoliday ? [publicHoliday.name] : []),
          ...items.map((item) => item.type),
          ...recordLabels,
        ])];

        return (
          <Box
            onClick={readOnly ? undefined : () => onEdit(row.id, day.date)}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: readOnly ? 'default' : 'pointer',
              px: 0.5,
              '&:hover': readOnly ? undefined : { bgcolor: '#f8fafc' },
            }}
          >
            <div className="whitespace-nowrap text-xs font-semibold">
              {record?.checkIn ? `출 ${record.checkIn}` : '출 -'}{' '}
              <span className="text-slate-400">/</span>{' '}
              {record?.checkOut ? `퇴 ${record.checkOut}` : '퇴 -'}
            </div>

            {attendanceLabels.length > 0 && (
              <Chip
                size="small"
                label={attendanceLabels.join(', ')}
                sx={{
                  mt: 0.5,
                  height: 20,
                  maxWidth: '100%',
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  fontSize: 10,
                  fontWeight: 700,
                  '& .MuiChip-label': {
                    px: 0.75,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            )}
          </Box>
        );
      },
    })),
  ];

  return { rows, columns, departments };
}
