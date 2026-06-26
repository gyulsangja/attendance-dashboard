'use client';

import { Chip, Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { getKoreanPublicHoliday } from '@/lib/date';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { AttendanceRecord, OperationSchedule } from '@/types/domain';

export type WeeklyAttendanceEmployeeRow = {
  id: number;
  name: string;
  shiftWorker: boolean;
  department: string;
};

type UseWeeklyAttendanceGridParams = {
  days: { date: string; label: string }[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  department: string;
  onEdit: (employeeId: number, date: string) => void;
  readOnly?: boolean;
};

const getDayClassName = (date: string, type: 'header' | 'cell') => {
  const day = new Date(`${date}T00:00:00`).getDay();
  if (getKoreanPublicHoliday(date) || day === 0) return `attendance-holiday-${type}`;
  if (day === 6) return `attendance-saturday-${type}`;
  return '';
};

export function useWeeklyAttendanceGrid({
  days,
  records,
  schedules,
  department,
  onEdit,
  readOnly = false,
}: UseWeeklyAttendanceGridParams) {
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organizationSnapshot = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    days[0]?.date ?? '2026-06-01',
  );
  const weekEmployees = organizationSnapshot.employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    shiftWorker: employee.shiftWorker,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
  }));
  const departments = [...new Set(weekEmployees.map((employee) => employee.department))];
  const rows = weekEmployees.filter(
    (employee) => department === 'all' || employee.department === department,
  );

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
    ...days.map((day) => ({
      field: day.date,
      headerName: day.label,
      headerClassName: getDayClassName(day.date, 'header'),
      cellClassName: getDayClassName(day.date, 'cell'),
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
        const codesAtDate = getAttendanceCodesAtDate(
          codeMaster.codes,
          codeMaster.history,
          day.date,
        );
        const recordLabels = record?.events.map(
          (event) => codesAtDate.find((code) => code.id === event.codeId)?.label
            ?? event.codeId,
        ) ?? [];
        const publicHoliday = row.shiftWorker ? null : getKoreanPublicHoliday(day.date);
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
