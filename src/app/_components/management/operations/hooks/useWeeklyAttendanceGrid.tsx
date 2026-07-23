'use client';

import { Box, Checkbox, Chip, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { MailSelectionTarget } from '@/app/_components/management/operations/WeeklyAttendanceGrid';
import { dedupeAttendanceEventsByStatusCode } from '@/lib/attendance/attendanceCodeCanonical';
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
  mailSelectionTargets?: MailSelectionTarget[];
  selectedMailTargetKeys?: string[];
  onToggleMailTarget?: (key: string) => void;
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
  mailSelectionTargets = [],
  selectedMailTargetKeys = [],
  onToggleMailTarget,
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
  const selectedMailTargetSet = new Set(selectedMailTargetKeys);

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
      minWidth: 132,
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
        const recordEntries = record?.events.map((event) => {
          const codeLabel = attendanceCodeMap.get(event.codeId);
          return {
            codeId: event.codeId,
            label: codeLabel || (event.detail && event.detail !== event.codeId ? event.detail : event.codeId),
          };
        }) ?? [];
        const publicHoliday = !row.shiftWorker && record?.isHoliday && record.holidayName
          ? { codeId: `HOLIDAY-${record.holidayName}`, label: record.holidayName }
          : null;
        const attendanceLabels = dedupeAttendanceEventsByStatusCode(
          [
            ...(publicHoliday ? [publicHoliday] : []),
            ...items.map((item) => ({ codeId: item.codeId || item.type, detail: item.type })),
            ...recordEntries.map((item) => ({ codeId: item.codeId, detail: item.label })),
          ],
          attendanceCodes,
        ).map((item) => item.canonicalLabel);
        const chipLabel = attendanceLabels.join(', ');
        const cellMailTargets = mailSelectionTargets.filter(
          (target) => target.employeeId === row.id && target.date === day.date,
        );
        const selectedCellMailTargetCount = cellMailTargets.filter((target) =>
          selectedMailTargetSet.has(target.key)).length;
        const canSelectMailTargets = cellMailTargets.length > 0 && Boolean(onToggleMailTarget);
        const allCellMailTargetsSelected = canSelectMailTargets
          && selectedCellMailTargetCount === cellMailTargets.length;

        const toggleCellMailTargets = () => {
          if (!onToggleMailTarget) return;

          const shouldSelect = !allCellMailTargetsSelected;
          cellMailTargets.forEach((target) => {
            const selected = selectedMailTargetSet.has(target.key);
            if (shouldSelect !== selected) onToggleMailTarget(target.key);
          });
        };
        const toggleMailTargetOnly = (key: string) => {
          if (!onToggleMailTarget) return;
          onToggleMailTarget(key);
        };
        const handleCellClick = () => {
          if (canSelectMailTargets) {
            if (cellMailTargets.length === 1) toggleMailTargetOnly(cellMailTargets[0].key);
            return;
          }
          if (!readOnly) onEdit(row.id, day.date);
        };

        return (
          <Box
            onClick={handleCellClick}
            sx={{
              width: 'calc(100% - 4px)',
              height: 'calc(100% - 4px)',
              m: '2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              textAlign: 'center',
              cursor: canSelectMailTargets || !readOnly ? 'pointer' : 'default',
              px: 0.5,
              border: '1px solid transparent',
              borderRadius: 1,
              boxShadow: 'none',
              bgcolor: allCellMailTargetsSelected ? '#eef2ff' : undefined,
              '&:hover': canSelectMailTargets || !readOnly
                ? {
                  bgcolor: allCellMailTargetsSelected ? '#eef2ff' : '#f8fafc',
                  boxShadow: 'none',
                }
                : undefined,
            }}
          >
            {canSelectMailTargets && (
              <Checkbox
                size="small"
                checked={allCellMailTargetsSelected}
                indeterminate={
                  selectedCellMailTargetCount > 0
                  && selectedCellMailTargetCount < cellMailTargets.length
                }
                onClick={(event) => {
                  event.stopPropagation();
                  toggleCellMailTargets();
                }}
                onChange={() => {}}
                sx={{
                  position: 'absolute',
                  top: 3,
                  left: 3,
                  p: 0.25,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  borderRadius: 1,
                  '& .MuiSvgIcon-root': { fontSize: 16 },
                }}
              />
            )}

            <div className="whitespace-nowrap text-xs font-semibold">
              {record?.checkIn ? `출 ${record.checkIn}` : '출 -'}{' '}
              <span className="text-slate-400">/</span>{' '}
              {record?.checkOut ? `퇴 ${record.checkOut}` : '퇴 -'}
            </div>

            {canSelectMailTargets ? (
              <Stack
                direction="row"
                spacing={0.5}
                useFlexGap
                sx={{
                  mt: 0.5,
                  maxWidth: 'calc(100% - 6px)',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {cellMailTargets.map((target) => {
                  const selected = selectedMailTargetSet.has(target.key);
                  return (
                    <Chip
                      key={target.key}
                      size="small"
                      label={target.codeName || target.codeId}
                      title={`${target.codeName || target.codeId} (${target.codeId})`}
                      variant={selected ? 'filled' : 'outlined'}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleMailTargetOnly(target.key);
                      }}
                      sx={{
                        height: 20,
                        maxWidth: 86,
                        bgcolor: selected ? '#eef2ff' : '#ffffff',
                        color: selected ? '#3730a3' : '#475569',
                        borderColor: selected ? '#818cf8' : '#cbd5e1',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        '& .MuiChip-label': {
                          px: 0.75,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            ) : attendanceLabels.length > 0 && (
              <Chip
                size="small"
                label={chipLabel}
                title={chipLabel}
                sx={{
                  mt: 0.5,
                  height: 20,
                  maxWidth: 'calc(100% - 6px)',
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


