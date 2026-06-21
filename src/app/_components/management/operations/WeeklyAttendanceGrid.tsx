'use client';

import { useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { type AttendanceRecord, type OperationSchedule } from '@/mocks';
import { useAppSelector } from '@/store/hooks';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';

type WeeklyAttendanceGridProps = {
  days: { date: string; label: string }[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  onEdit: (employeeId: number, date: string) => void;
};

export default function WeeklyAttendanceGrid({
  days,
  records,
  schedules,
  onEdit,
}: WeeklyAttendanceGridProps) {
  const [department, setDepartment] = useState('all');
  const organization = useAppSelector((state) => state.organization);
  const organizationSnapshot = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    days[0]?.date ?? '2026-06-01',
  );
  const weekEmployees = organizationSnapshot.employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
  }));
  const departments = [
    ...new Set(weekEmployees.map((employee) => employee.department)),
  ];
  const rows = weekEmployees.filter(
    (employee) =>
      department === 'all' || employee.department === department,
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
      minWidth: 130,
      flex: 1,
      align: 'center' as const,
      headerAlign: 'center' as const,
      sortable: false,
      filterable: false,
      renderCell: ({ row }: { row: { id: number } }) => {
        const record = records.find(
          (item) =>
            item.employeeId === row.id && item.date === day.date,
        );
        const items = schedules.filter(
          (item) =>
            item.employeeId === row.id && item.date === day.date,
        );

        return (
          <Box
            onClick={() => onEdit(row.id, day.date)}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              px: 0.5,
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <div className="whitespace-nowrap text-xs font-semibold">
              {record?.checkIn ? `출 ${record.checkIn}` : '출 -'}{' '}
              <span className="text-slate-400">/</span>{' '}
              {record?.checkOut ? `퇴 ${record.checkOut}` : '퇴 -'}
            </div>

            {items.length > 0 && (
              <Chip
                size="small"
                label={items.map((item) => item.type).join(', ')}
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

  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold">주간 출퇴근 통합 현황</h3>
          <p className="mt-1 text-sm text-slate-500">
            날짜 셀을 클릭하면 출퇴근 시간을 수정할 수 있습니다.
          </p>
        </div>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>부서</InputLabel>
          <Select
            value={department}
            label="부서"
            onChange={(event) => setDepartment(event.target.value)}
          >
            <MenuItem value="all">전체 부서</MenuItem>
            {departments.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <Box sx={{ height: 610, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={72}
          columnHeaderHeight={48}
          pageSizeOptions={[10, 20, 30]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
          disableRowSelectionOnClick
          sx={{
            width: '100%',
            borderColor: '#e2e8f0',
            '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
            '& .MuiDataGrid-columnHeaderTitle': {
              width: '100%',
              textAlign: 'center',
              fontWeight: 700,
            },
            '& .MuiDataGrid-cell': {
              p: 0,
              justifyContent: 'center',
              overflow: 'hidden',
            },
          }}
        />
      </Box>
    </div>
  );
}
