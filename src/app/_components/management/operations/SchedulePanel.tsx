'use client';

import { Box, Button } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { OperationSchedule } from '@/mocks';

export default function SchedulePanel({ rows, onAdd, onEdit, onDelete }: { rows: OperationSchedule[]; onAdd: () => void; onEdit: (row: OperationSchedule) => void; onDelete: (id: number) => void; }) {
  const columns: GridColDef<OperationSchedule>[] = [
    { field: 'date', headerName: '일자', minWidth: 130, flex: .8 }, { field: 'department', headerName: '부서', minWidth: 130, flex: 1 },
    { field: 'name', headerName: '이름', minWidth: 100, flex: .7 }, { field: 'type', headerName: '근태 일정', minWidth: 110, flex: .8 },
    { field: 'detail', headerName: '비고', minWidth: 170, flex: 1.3 },
    {
      field: 'actions',
      headerName: '관리',
      width: 160,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            width: '100%',
            height: '100%',
          }}
        >
          <Button size="small" onClick={() => onEdit(row)}>
            수정
          </Button>
          <Button size="small" color="inherit" onClick={() => onDelete(row.id)}>
            삭제
          </Button>
        </Box>
      ),
    },
  ];
  return <>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="font-bold">연차·반차 등 근태 일정</h2>
        <p className="mt-1 text-sm text-slate-500">관리팀이 직원의 사전 근태 일정을 입력하고 수정합니다.</p>
      </div>
      <Button variant="contained" startIcon={<EventAvailable />} onClick={onAdd} sx={{ bgcolor: '#0f172a' }}>일정 입력</Button>
    </div>
    <Box sx={{ height: 430 }}>
      <DataGrid rows={rows} columns={columns} localeText={koKR.components.MuiDataGrid.defaultProps.localeText} disableRowSelectionOnClick sx={{ borderColor: '#e2e8f0', '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' } }} />
    </Box>
  </>;
}
