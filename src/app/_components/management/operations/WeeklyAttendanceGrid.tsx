'use client';

import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useWeeklyAttendanceGrid } from '@/app/_components/management/operations/hooks/useWeeklyAttendanceGrid';
import type { AttendanceCode, AttendanceRecord, OperationSchedule } from '@/types/domain';

type WeeklyAttendanceGridProps = {
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
  onEdit: (employeeId: number, date: string) => void;
  readOnly?: boolean;
};

export default function WeeklyAttendanceGrid({
  days,
  employees = [],
  records,
  schedules,
  attendanceCodes = [],
  onEdit,
  readOnly = false,
}: WeeklyAttendanceGridProps) {
  const [department, setDepartment] = useState('all');
  const { rows, columns, departments } = useWeeklyAttendanceGrid({
    days,
    employees,
    records,
    schedules,
    attendanceCodes,
    department,
    onEdit,
    readOnly,
  });

  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold">주간 출퇴근 통합 현황</h3>
          <p className="mt-1 text-sm text-slate-500">
            {readOnly ? '확정 상태에서는 출퇴근 시간 수동 수정을 제한합니다.' : '날짜 셀을 클릭하면 출퇴근 시간을 수정할 수 있습니다.'}
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
            '& .attendance-holiday-header': {
              bgcolor: '#fff1f2',
              color: '#dc2626',
            },
            '& .attendance-saturday-header': {
              bgcolor: '#eff6ff',
              color: '#2563eb',
            },
            '& .attendance-holiday-cell': {
              bgcolor: '#fff7f7',
            },
            '& .attendance-saturday-cell': {
              bgcolor: '#f7faff',
            },
            '& .attendance-holiday-cell:hover': {
              bgcolor: '#fff1f2',
            },
            '& .attendance-saturday-cell:hover': {
              bgcolor: '#eff6ff',
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
